from dataclasses import dataclass
from typing import Optional
from app.application.use_case.autor.create_autor_use_case import validar_autor_unico
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.autor import Autor
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.autor_repository_i import AutorRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class UpdateAutorUseCase:
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
        id: Optional[int]
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
            Rol.RECEPCIONISTA,
        )
        nombre = (command.nombre or "").strip()
        apellido = (command.apellido or "").strip()
        if command.id is None or not nombre or not apellido:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        existing = self.autor_repository.get_by_id(command.id)
        if existing is None:
            raise ErrorHandler(ErrorType.AUTOR_NOT_FOUND)

        validar_autor_unico(self.autor_repository, nombre, apellido, exclude_id=command.id)

        existing.nombre = nombre
        existing.apellido = apellido
        updated = self.autor_repository.update(command.id, existing)
        if updated is None:
            raise ErrorHandler(ErrorType.AUTOR_NOT_FOUND)
        return UpdateAutorUseCase.Result(autor=updated)
