from dataclasses import dataclass
from datetime import date
from typing import List, Optional
from uuid import uuid4
from app.application.strategy.ejemplar_estado.core.ejemplar_estado_state_factory import (
    EjemplarEstadoStateFactory,
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
from app.domain.repository.sede_repository_i import SedeRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class CreateRemitoUseCase:
    def __init__(
        self,
        remito_repository: RemitoRepositoryI,
        historial_repository: HistorialEstadoRemitoRepositoryI,
        sede_repository: SedeRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        ejemplar_state_factory: Optional[EjemplarEstadoStateFactory] = None,
    ) -> None:
        self.remito_repository = remito_repository
        self.historial_repository = historial_repository
        self.sede_repository = sede_repository
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository
        self.ejemplar_state_factory = ejemplar_state_factory or EjemplarEstadoStateFactory()

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        sede_origen_id: Optional[int]
        sede_destino_id: Optional[int]
        ejemplar_ids: List[int]
        fechaEmision: Optional[date]

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
        if (
            command.sede_origen_id is None
            or command.sede_destino_id is None
            or not command.ejemplar_ids
        ):
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        sede_origen = self.sede_repository.get_by_id(command.sede_origen_id)
        if sede_origen is None:
            raise ErrorHandler(ErrorType.SEDE_NOT_FOUND)
        sede_origen.validar_activa()

        sede_destino = self.sede_repository.get_by_id(command.sede_destino_id)
        if sede_destino is None:
            raise ErrorHandler(ErrorType.SEDE_NOT_FOUND)
        sede_destino.validar_activa()

        for ej_id in command.ejemplar_ids:
            ejemplar = self.ejemplar_repository.get_by_id(ej_id)
            if ejemplar is None:
                raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)
            self.ejemplar_state_factory.get_state(ejemplar.estado).validar_envio(ejemplar)

        fecha_emision = command.fechaEmision or date.today()
        remito = Remito(
            numero=f"REM-{uuid4().hex[:8].upper()}",
            fechaEmision=fecha_emision,
            sede_origen_id=command.sede_origen_id,
            sede_destino_id=command.sede_destino_id,
            ejemplar_ids=command.ejemplar_ids,
        )
        saved_remito = self.remito_repository.save(remito)

        historial = HistorialEstadoRemito(
            fechaInicio=fecha_emision,
            fechaFin=None,
            estado=EstadoEnvio.EMPACADO,
            remito_id=saved_remito.id,
        )
        self.historial_repository.save(historial)

        return CreateRemitoUseCase.Result(remito=saved_remito)
