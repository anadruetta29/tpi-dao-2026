from dataclasses import dataclass
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.libro_repository_i import LibroRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class DeleteLibroUseCase:
    def __init__(
        self,
        libro_repository: LibroRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.libro_repository = libro_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]

    @dataclass(frozen=True)
    class Result:
        deleted: bool

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

        deleted = self.libro_repository.delete(command.id)
        if not deleted:
            raise ErrorHandler(ErrorType.LIBRO_NOT_FOUND)

        return DeleteLibroUseCase.Result(deleted=True)
