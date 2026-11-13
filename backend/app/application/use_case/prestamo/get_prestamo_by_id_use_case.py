from dataclasses import dataclass
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.prestamo import Prestamo
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.prestamo_repository_i import PrestamoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetPrestamoByIdUseCase:
    def __init__(
        self,
        prestamo_repository: PrestamoRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.prestamo_repository = prestamo_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]

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
        if command.id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        prestamo = self.prestamo_repository.get_by_id(command.id)
        if prestamo is None:
            raise ErrorHandler(ErrorType.PRESTAMO_NOT_FOUND)

        return GetPrestamoByIdUseCase.Result(prestamo=prestamo)
