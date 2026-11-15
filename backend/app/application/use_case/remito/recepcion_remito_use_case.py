from contextlib import nullcontext
from dataclasses import dataclass
from datetime import date
from typing import Callable, ContextManager, Optional
from app.application.strategy.remito_estado.core.remito_estado_state_factory import (
    RemitoEstadoStateFactory,
)
from app.application.use_case.prestamo.create_prestamo_use_case import CreatePrestamoUseCase
from app.application.use_case.reserva.asignar_reserva_use_case import asignar_reserva
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.historial_estado_remito import HistorialEstadoRemito
from app.domain.entity.remito import Remito
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.aviso_repository_i import AvisoRepositoryI
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.historial_estado_remito_repository_i import HistorialEstadoRemitoRepositoryI
from app.domain.repository.remito_repository_i import RemitoRepositoryI
from app.domain.repository.reserva_repository_i import ReservaRepositoryI
from app.domain.repository.solicitud_prestamo_repository_i import SolicitudPrestamoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class RecepcionRemitoUseCase:
    def __init__(
        self,
        remito_repository: RemitoRepositoryI,
        historial_repository: HistorialEstadoRemitoRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        remito_state_factory: Optional[RemitoEstadoStateFactory] = None,
        *,
        solicitud_repository: SolicitudPrestamoRepositoryI,
        crear_prestamo: CreatePrestamoUseCase,
        reserva_repository: Optional[ReservaRepositoryI] = None,
        aviso_repository: Optional[AvisoRepositoryI] = None,
        transaction: Callable[[], ContextManager] = nullcontext,
    ) -> None:
        self.remito_repository = remito_repository
        self.historial_repository = historial_repository
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository
        self.solicitud_repository = solicitud_repository
        self.crear_prestamo = crear_prestamo
        self.reserva_repository = reserva_repository
        self.aviso_repository = aviso_repository
        self.transaction = transaction
        self.remito_state_factory = remito_state_factory or RemitoEstadoStateFactory()

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]
        fechaRecepcion: Optional[date]
        con_incidencia: bool = False

    @dataclass(frozen=True)
    class Result:
        remito: Remito

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
        if command.id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        remito = self.remito_repository.get_by_id_for_update(command.id)
        if remito is None:
            raise ErrorHandler(ErrorType.REMITO_NOT_FOUND)

        user.validar_sede(remito.sede_destino_id)
        hoy = date.today()
        fecha_recepcion = command.fechaRecepcion or hoy
        latest = self.historial_repository.get_latest_by_remito_id(command.id)
        if fecha_recepcion > hoy or (latest and latest.fechaInicio is not None and fecha_recepcion < latest.fechaInicio):
            raise ErrorHandler(ErrorType.BAD_REQUEST, "La recepción debe registrarse entre el último movimiento y hoy.")
        estado_actual = latest.estado if latest is not None else EstadoEnvio.PENDIENTE
        state = self.remito_state_factory.get_state(estado_actual)
        nuevo_estado = state.recibir(remito, fecha_recepcion, command.con_incidencia)

        updated_remito = self.remito_repository.update(command.id, remito)
        if updated_remito is None:
            raise ErrorHandler(ErrorType.REMITO_NOT_FOUND)

        if latest is not None and latest.id is not None and latest.fechaFin is None:
            latest.fechaFin = fecha_recepcion
            self.historial_repository.update(latest.id, latest)

        self.historial_repository.save(
            HistorialEstadoRemito.registrar(nuevo_estado, command.id, fecha_recepcion, user, cerrado=True)
        )

        if nuevo_estado == EstadoEnvio.RECIBIDO:
            solicitud = None
            if updated_remito.solicitud_id is not None:
                solicitud = self.solicitud_repository.get_by_id_for_update(updated_remito.solicitud_id)
                if solicitud is None:
                    raise ErrorHandler(ErrorType.SOLICITUD_NOT_FOUND)
            for ej_id in sorted(updated_remito.ejemplar_ids):
                ejemplar = self.ejemplar_repository.get_by_id_for_update(ej_id)
                if ejemplar is None:
                    raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)
                ejemplar.recibir_en_sede(updated_remito.sede_destino_id)
                self.ejemplar_repository.update(ej_id, ejemplar)
                if (solicitud is None or solicitud.socio_id is None) and self.reserva_repository is not None:
                    if asignar_reserva(
                        ejemplar,
                        self.reserva_repository,
                        fecha_recepcion,
                        aviso_repository=self.aviso_repository,
                    ) is not None:
                        self.ejemplar_repository.update(ej_id, ejemplar)
            if solicitud is not None:
                self.crear_prestamo.efectivizar(solicitud)
                solicitud.responsable_destino_id = user.id
                self.solicitud_repository.update(solicitud.id, solicitud)

        return RecepcionRemitoUseCase.Result(remito=updated_remito)
