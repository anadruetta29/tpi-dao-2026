from contextlib import nullcontext
from dataclasses import dataclass
from datetime import date
from typing import Callable, ContextManager, Optional
from app.application.strategy.remito_estado.core.remito_estado_state_factory import (
    RemitoEstadoStateFactory,
)
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.historial_estado_remito import HistorialEstadoRemito
from app.domain.entity.remito import Remito
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.historial_estado_remito_repository_i import HistorialEstadoRemitoRepositoryI
from app.domain.repository.remito_repository_i import RemitoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class DespachoRemitoUseCase:
    def __init__(
        self,
        remito_repository: RemitoRepositoryI,
        historial_repository: HistorialEstadoRemitoRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        remito_state_factory: Optional[RemitoEstadoStateFactory] = None,
        transaction: Callable[[], ContextManager] = nullcontext,
    ) -> None:
        self.remito_repository = remito_repository
        self.historial_repository = historial_repository
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository
        self.transaction = transaction
        self.remito_state_factory = remito_state_factory or RemitoEstadoStateFactory()

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]
        fechaDespacho: Optional[date]

    @dataclass(frozen=True)
    class Result:
        remito: Remito

    def execute(self, command: Command) -> Result:
        with self.transaction():
            return self._execute(command)

    def empacar(self, command: Command) -> Result:
        with self.transaction():
            return self._execute(command, empaque=True)

    def _execute(self, command: Command, empaque: bool = False) -> Result:
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

        user.validar_sede(remito.sede_origen_id)
        fecha = date.today() if not empaque else (command.fechaDespacho or date.today())
        latest = self.historial_repository.get_latest_by_remito_id(command.id)
        estado_actual = latest.estado if latest is not None else EstadoEnvio.PENDIENTE
        state = self.remito_state_factory.get_state(estado_actual)
        if fecha > date.today() or (latest and latest.fechaInicio is not None and fecha < latest.fechaInicio):
            raise ErrorHandler(ErrorType.BAD_REQUEST, "La fecha debe estar entre el último movimiento y hoy.")
        nuevo_estado = state.empacar() if empaque else state.despachar(remito, fecha)

        updated_remito = self.remito_repository.update(command.id, remito)
        if updated_remito is None:
            raise ErrorHandler(ErrorType.REMITO_NOT_FOUND)

        if latest is not None and latest.id is not None and latest.fechaFin is None:
            latest.fechaFin = fecha
            self.historial_repository.update(latest.id, latest)

        self.historial_repository.save(HistorialEstadoRemito.registrar(nuevo_estado, command.id, fecha, user))

        if not empaque:
            estado_esperado = EstadoEjemplar.RESERVADO if remito.solicitud_id is not None else EstadoEjemplar.DISPONIBLE
            for ej_id in sorted(updated_remito.ejemplar_ids):
                ejemplar = self.ejemplar_repository.get_by_id_for_update(ej_id)
                if ejemplar is None:
                    raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)
                ejemplar.validar_en_sede(updated_remito.sede_origen_id)
                if ejemplar.estado != estado_esperado:
                    raise ErrorHandler(ErrorType.EJEMPLAR_NOT_AVAILABLE)
                ejemplar.marcar_en_transito()
                self.ejemplar_repository.update(ej_id, ejemplar)

        return DespachoRemitoUseCase.Result(remito=updated_remito)
