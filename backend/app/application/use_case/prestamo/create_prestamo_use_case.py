from contextlib import nullcontext
from dataclasses import dataclass
from datetime import date
from typing import Callable, ContextManager, Optional
from app.application.strategy.ejemplar_estado.core.ejemplar_estado_state_factory import (
    EjemplarEstadoStateFactory,
)
from app.application.strategy.vencimiento_prestamo.core.vencimiento_prestamo_strategy_factory import (
    VencimientoPrestamoStrategyFactory,
)
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.domain.entity.modalidad_prestamo_local import ModalidadPrestamoLocal
from app.domain.entity.prestamo import Prestamo
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.prestamo_repository_i import PrestamoRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI
from app.domain.repository.solicitud_prestamo_repository_i import SolicitudPrestamoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class CreatePrestamoUseCase:
    def __init__(
        self,
        prestamo_repository: PrestamoRepositoryI,
        solicitud_repository: SolicitudPrestamoRepositoryI,
        socio_repository: SocioRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        ejemplar_state_factory: Optional[EjemplarEstadoStateFactory] = None,
        vencimiento_strategy_factory: Optional[VencimientoPrestamoStrategyFactory] = None,
        transaction: Callable[[], ContextManager] = nullcontext,
    ) -> None:
        self.prestamo_repository = prestamo_repository
        self.solicitud_repository = solicitud_repository
        self.socio_repository = socio_repository
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository
        self.transaction = transaction
        self.ejemplar_state_factory = ejemplar_state_factory or EjemplarEstadoStateFactory()
        self.vencimiento_strategy_factory = (
            vencimiento_strategy_factory or VencimientoPrestamoStrategyFactory()
        )

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        solicitud_id: Optional[int]
        modalidad: Optional[ModalidadPrestamoLocal]
        fechaInicio: Optional[date]
        fechaVencimiento: Optional[date]

    @dataclass(frozen=True)
    class Result:
        prestamo: Prestamo

    def execute(self, command: Command) -> Result:
        with self.transaction():
            return self._execute(command)

    def _execute(self, command: Command) -> Result:
        user = AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.RECEPCIONISTA,
        )
        if command.solicitud_id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        hoy = date.today()
        fecha_inicio = command.fechaInicio or hoy
        if fecha_inicio < hoy:
            raise ErrorHandler(ErrorType.PRESTAMO_INICIO_ANTERIOR)

        if fecha_inicio > hoy:
            raise ErrorHandler(ErrorType.PRESTAMO_INICIO_FUTURO)
        if command.fechaVencimiento is not None and command.fechaVencimiento < hoy:
            raise ErrorHandler(ErrorType.PRESTAMO_VENCIMIENTO_ANTERIOR)

        solicitud = self.solicitud_repository.get_by_id_for_update(command.solicitud_id)
        if solicitud is None:
            raise ErrorHandler(ErrorType.SOLICITUD_NOT_FOUND)
        user.validar_sede(solicitud.sede_efectiva())
        if solicitud.tipo == TipoPrestamo.INTERBIBLIOTECARIO:
            raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION, "El préstamo interbibliotecario se activa al recibir el remito.")

        prestamo = self.efectivizar(solicitud, command.modalidad, command.fechaVencimiento)
        return CreatePrestamoUseCase.Result(prestamo=prestamo)

    def existe_para_solicitud(self, solicitud_id: int) -> bool:
        return self.prestamo_repository.get_by_solicitud_id(solicitud_id) is not None

    def efectivizar(
        self,
        solicitud: SolicitudPrestamo,
        modalidad: Optional[ModalidadPrestamoLocal] = None,
        fecha_vencimiento: Optional[date] = None,
    ) -> Prestamo:
        solicitud.validar_aprobada()
        if self.existe_para_solicitud(solicitud.id):
            raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION, "La solicitud ya tiene un préstamo asociado.")

        fecha_inicio = date.today()
        modalidad = modalidad or ModalidadPrestamoLocal.DOMICILIO
        if modalidad == ModalidadPrestamoLocal.SALA_LECTURA:
            if fecha_vencimiento is not None and fecha_vencimiento != fecha_inicio:
                raise ErrorHandler(ErrorType.BAD_REQUEST, "Los préstamos en sala de lectura vencen en el día.")
            fecha_vencimiento = fecha_inicio
        else:
            fecha_vencimiento = fecha_vencimiento or (
                self.vencimiento_strategy_factory.get_strategy(modalidad).calcular_vencimiento(fecha_inicio)
            )
        if fecha_vencimiento < fecha_inicio:
            raise ErrorHandler(ErrorType.PRESTAMO_VENCIMIENTO_ANTERIOR)

        if solicitud.socio_id is not None:
            socio = self.socio_repository.get_by_id(solicitud.socio_id)
            if socio is None:
                raise ErrorHandler(ErrorType.SOCIO_NOT_FOUND)
            socio.validar_habilitado()

        if not solicitud.ejemplar_ids:
            raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)

        for ejemplar_id in sorted(solicitud.ejemplar_ids):
            ejemplar = self.ejemplar_repository.get_by_id_for_update(ejemplar_id)
            if ejemplar is None:
                raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)
            ejemplar.validar_en_sede(solicitud.sede_efectiva())
            self.ejemplar_state_factory.get_state(ejemplar.estado).prestar(ejemplar)
            self.ejemplar_repository.update(ejemplar_id, ejemplar)

        prestamo = Prestamo(
            fechaInicio=fecha_inicio,
            fechaVencimiento=fecha_vencimiento,
            estado=EstadoPrestamo.ACTIVO,
            modalidad=modalidad,
            solicitud_id=solicitud.id,
            socio_id=solicitud.socio_id,
            sede_id=solicitud.sede_efectiva(),
            ejemplar_ids=solicitud.ejemplar_ids,
        )
        return self.prestamo_repository.save(prestamo)
