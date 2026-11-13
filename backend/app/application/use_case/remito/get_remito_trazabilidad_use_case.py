from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.historial_estado_remito import HistorialEstadoRemito
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.historial_estado_remito_repository_i import HistorialEstadoRemitoRepositoryI
from app.domain.repository.remito_repository_i import RemitoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetRemitoTrazabilidadUseCase:
    def __init__(
        self,
        remito_repository: RemitoRepositoryI,
        historial_repository: HistorialEstadoRemitoRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.remito_repository = remito_repository
        self.historial_repository = historial_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]

    @dataclass(frozen=True)
    class Result:
        remito_id: int
        historial: List[HistorialEstadoRemito]

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

        historial = self.historial_repository.get_by_remito_id(command.id)
        return GetRemitoTrazabilidadUseCase.Result(remito_id=command.id, historial=historial)
