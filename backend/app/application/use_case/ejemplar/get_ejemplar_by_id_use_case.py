from dataclasses import dataclass
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetEjemplarByIdUseCase:
    def __init__(
        self,
        ejemplar_repository: EjemplarRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]

    @dataclass(frozen=True)
    class Result:
        ejemplar: Ejemplar

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

        ejemplar = self.ejemplar_repository.get_by_id(command.id)
        if ejemplar is None:
            raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)

        return GetEjemplarByIdUseCase.Result(ejemplar=ejemplar)
