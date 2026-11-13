from dataclasses import dataclass
from datetime import date
from typing import Optional
from app.application.strategy.remito_estado.core.remito_estado_state_factory import (
    RemitoEstadoStateFactory,
)
from app.core.helper.auth_helper import AuthHelper
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
    ) -> None:
        self.remito_repository = remito_repository
        self.historial_repository = historial_repository
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository
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
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        if command.id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        remito = self.remito_repository.get_by_id(command.id)
        if remito is None:
            raise ErrorHandler(ErrorType.REMITO_NOT_FOUND)

        fecha_despacho = command.fechaDespacho or date.today()
        latest = self.historial_repository.get_latest_by_remito_id(command.id)
        estado_actual = latest.estado if latest is not None else EstadoEnvio.PENDIENTE
        state = self.remito_state_factory.get_state(estado_actual)
        nuevo_estado = state.despachar(remito, fecha_despacho)

        updated_remito = self.remito_repository.update(command.id, remito)
        if updated_remito is None:
            raise ErrorHandler(ErrorType.REMITO_NOT_FOUND)

        if latest is not None and latest.id is not None and latest.fechaFin is None:
            latest.fechaFin = fecha_despacho
            self.historial_repository.update(latest.id, latest)

        self.historial_repository.save(
            HistorialEstadoRemito(
                fechaInicio=fecha_despacho,
                fechaFin=None,
                estado=nuevo_estado,
                remito_id=command.id,
            )
        )

        for ej_id in updated_remito.ejemplar_ids:
            ejemplar = self.ejemplar_repository.get_by_id(ej_id)
            if ejemplar is not None and ejemplar.id is not None:
                ejemplar.marcar_en_transito()
                self.ejemplar_repository.update(ejemplar.id, ejemplar)

        return DespachoRemitoUseCase.Result(remito=updated_remito)
