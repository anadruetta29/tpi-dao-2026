from contextlib import nullcontext
from dataclasses import dataclass
from datetime import date
from typing import Callable, ContextManager, Optional
from app.application.strategy.solicitud_estado.core.solicitud_estado_state_factory import (
    SolicitudEstadoStateFactory,
)
from app.application.use_case.prestamo.create_prestamo_use_case import CreatePrestamoUseCase
from app.application.use_case.remito.create_remito_use_case import CreateRemitoUseCase
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.modalidad_prestamo_local import ModalidadPrestamoLocal
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.domain.entity.rol import Rol
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.solicitud_prestamo_repository_i import SolicitudPrestamoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class UpdateSolicitudEstadoUseCase:
    def __init__(
        self,
        solicitud_repository: SolicitudPrestamoRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        solicitud_state_factory: Optional[SolicitudEstadoStateFactory] = None,
        *,
        crear_prestamo: CreatePrestamoUseCase,
        crear_remito: CreateRemitoUseCase,
        transaction: Callable[[], ContextManager] = nullcontext,
    ) -> None:
        self.solicitud_repository = solicitud_repository
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository
        self.crear_prestamo = crear_prestamo
        self.crear_remito = crear_remito
        self.transaction = transaction
        self.solicitud_state_factory = solicitud_state_factory or SolicitudEstadoStateFactory()

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]
        estado: Optional[EstadoSolicitud]
        modalidad: Optional[ModalidadPrestamoLocal] = None
        fechaVencimiento: Optional[date] = None

    @dataclass(frozen=True)
    class Result:
        solicitud: SolicitudPrestamo

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
        if command.id is None or command.estado is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        solicitud = self.solicitud_repository.get_by_id_for_update(command.id)
        if solicitud is None:
            raise ErrorHandler(ErrorType.SOLICITUD_NOT_FOUND)

        user.validar_sede(solicitud.sede_origen_id, solicitud.sede_destino_id)
        if self.crear_prestamo.existe_para_solicitud(command.id) or self.crear_remito.existe_para_solicitud(command.id):
            raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION, "La solicitud ya tiene un préstamo o un remito asociado.")

        aprueba = command.estado == EstadoSolicitud.APROBADA
        aprobacion_anterior = aprueba and solicitud.estado == EstadoSolicitud.APROBADA
        interbibliotecario = solicitud.tipo == TipoPrestamo.INTERBIBLIOTECARIO
        recibido_anteriormente = False
        ejemplar = None
        if aprueba:
            ejemplares = []
            for id in sorted(solicitud.ejemplar_ids):
                copia = self.ejemplar_repository.get_by_id_for_update(id)
                if copia is None:
                    raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)
                ejemplares.append(copia)
            if not ejemplares:
                raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)
            ejemplar = ejemplares[0]
            recibido_anteriormente = aprobacion_anterior and interbibliotecario and all(
                copia.pertenece_a_sede(solicitud.sede_destino_id) for copia in ejemplares
            )
            sede = solicitud.sede_destino_id if recibido_anteriormente else solicitud.sede_origen_id
            user.validar_sede(sede)
            for copia in ejemplares:
                copia.validar_en_sede(sede)

        if not aprobacion_anterior:
            state = self.solicitud_state_factory.get_state(solicitud.estado)
            state.transicionar(solicitud, command.estado, user.id, ejemplar)
        elif recibido_anteriormente:
            solicitud.responsable_destino_id = user.id

        updated = self.solicitud_repository.update(command.id, solicitud)
        if updated is None:
            raise ErrorHandler(ErrorType.SOLICITUD_NOT_FOUND)

        if aprueba:
            if interbibliotecario:
                if recibido_anteriormente:
                    self.crear_prestamo.efectivizar(updated)
                else:
                    self.crear_remito.emitir_para_solicitud(updated, user)
            else:
                self.crear_prestamo.efectivizar(updated, command.modalidad, command.fechaVencimiento)

        return UpdateSolicitudEstadoUseCase.Result(solicitud=updated)
