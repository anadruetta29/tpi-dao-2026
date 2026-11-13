from dataclasses import dataclass
from datetime import date
from typing import Optional
from app.application.strategy.ejemplar_estado.core.ejemplar_estado_state_factory import (
    EjemplarEstadoStateFactory,
)
from app.application.strategy.vencimiento_prestamo.core.vencimiento_prestamo_strategy_factory import (
    VencimientoPrestamoStrategyFactory,
)
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.estado_socio import EstadoSocio
from app.domain.entity.estado_solicitud import EstadoSolicitud
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
    ) -> None:
        self.prestamo_repository = prestamo_repository
        self.solicitud_repository = solicitud_repository
        self.socio_repository = socio_repository
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository
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
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        if command.solicitud_id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        solicitud = self.solicitud_repository.get_by_id(command.solicitud_id)
        if solicitud is None:
            raise ErrorHandler(ErrorType.SOLICITUD_NOT_FOUND)
        if solicitud.estado != EstadoSolicitud.APROBADA:
            raise ErrorHandler(ErrorType.SOLICITUD_NOT_APPROVED)

        if solicitud.socio_id is not None:
            socio = self.socio_repository.get_by_id(solicitud.socio_id)
            if socio is None:
                raise ErrorHandler(ErrorType.SOCIO_NOT_FOUND)
            if socio.estado == EstadoSocio.INHABILITADO:
                raise ErrorHandler(ErrorType.SOCIO_INHABILITADO)

        if solicitud.ejemplar_id is None:
            raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)

        ejemplar = self.ejemplar_repository.get_by_id(solicitud.ejemplar_id)
        if ejemplar is None:
            raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)
        self.ejemplar_state_factory.get_state(ejemplar.estado).prestar(ejemplar)

        fecha_inicio = command.fechaInicio or date.today()
        modalidad = command.modalidad or ModalidadPrestamoLocal.DOMICILIO
        fecha_vencimiento = command.fechaVencimiento or (
            self.vencimiento_strategy_factory.get_strategy(modalidad).calcular_vencimiento(
                fecha_inicio
            )
        )

        self.ejemplar_repository.update(ejemplar.id, ejemplar)

        prestamo = Prestamo(
            fechaInicio=fecha_inicio,
            fechaVencimiento=fecha_vencimiento,
            estado=EstadoPrestamo.ACTIVO,
            modalidad=modalidad,
            solicitud_id=solicitud.id,
            socio_id=solicitud.socio_id,
            sede_id=solicitud.sede_destino_id or solicitud.sede_origen_id,
            ejemplar_id=ejemplar.id,
        )
        saved = self.prestamo_repository.save(prestamo)
        return CreatePrestamoUseCase.Result(prestamo=saved)
