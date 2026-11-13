from dataclasses import dataclass
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.autor import Autor
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.autor_repository_i import AutorRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class CreateAutorUseCase:
    def __init__(
        self,
        autor_repository: AutorRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.autor_repository = autor_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        nombre: Optional[str]
        apellido: Optional[str]

    @dataclass(frozen=True)
    class Result:
        autor: Autor

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        if not command.nombre or not command.apellido:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        autor = Autor(nombre=command.nombre, apellido=command.apellido)
        saved = self.autor_repository.save(autor)
        return CreateAutorUseCase.Result(autor=saved)
