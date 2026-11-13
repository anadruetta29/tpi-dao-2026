from dataclasses import dataclass
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.rol import Rol
from app.domain.entity.usuario import Usuario
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetUsuarioByIdUseCase:
    def __init__(self, usuario_repository: UsuarioRepositoryI) -> None:
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]

    @dataclass(frozen=True)
    class Result:
        usuario: Usuario

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(command.token, self.usuario_repository, Rol.ADMIN)
        if command.id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        usuario = self.usuario_repository.get_by_id(command.id)
        if usuario is None:
            raise ErrorHandler(ErrorType.USER_NOT_FOUND)

        return GetUsuarioByIdUseCase.Result(usuario=usuario)
