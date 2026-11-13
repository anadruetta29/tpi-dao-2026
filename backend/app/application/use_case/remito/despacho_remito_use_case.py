from dataclasses import dataclass
from datetime import date
from typing import Optional
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
    ) -> None:
        self.remito_repository = remito_repository
        self.historial_repository = historial_repository
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository

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
        remito.fechaDespacho = fecha_despacho
        updated_remito = self.remito_repository.update(command.id, remito)
        if updated_remito is None:
            raise ErrorHandler(ErrorType.REMITO_NOT_FOUND)

        latest = self.historial_repository.get_latest_by_remito_id(command.id)
        if latest is not None and latest.id is not None and latest.fechaFin is None:
            latest.fechaFin = fecha_despacho
            self.historial_repository.update(latest.id, latest)

        self.historial_repository.save(
            HistorialEstadoRemito(
                fechaInicio=fecha_despacho,
                fechaFin=None,
                estado=EstadoEnvio.EN_TRANSITO,
                remito_id=command.id,
            )
        )

        for ej_id in updated_remito.ejemplar_ids:
            ejemplar = self.ejemplar_repository.get_by_id(ej_id)
            if ejemplar is not None and ejemplar.id is not None:
                ejemplar.estado = EstadoEjemplar.EN_TRANSITO
                self.ejemplar_repository.update(ejemplar.id, ejemplar)

        return DespachoRemitoUseCase.Result(remito=updated_remito)
