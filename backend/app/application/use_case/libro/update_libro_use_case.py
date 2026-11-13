from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.libro import Libro
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.autor_repository_i import AutorRepositoryI
from app.domain.repository.libro_repository_i import LibroRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class UpdateLibroUseCase:
    def __init__(
        self,
        libro_repository: LibroRepositoryI,
        autor_repository: AutorRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.libro_repository = libro_repository
        self.autor_repository = autor_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]
        titulo: Optional[str]
        añoPublicacion: Optional[int]
        editorial: Optional[str]
        edicion: Optional[str]
        autor_ids: Optional[List[int]] = None

    @dataclass(frozen=True)
    class Result:
        libro: Libro

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

        libro = self.libro_repository.get_by_id(command.id)
        if libro is None:
            raise ErrorHandler(ErrorType.LIBRO_NOT_FOUND)

        if command.titulo is not None:
            libro.titulo = command.titulo
        if command.añoPublicacion is not None:
            libro.añoPublicacion = command.añoPublicacion
        if command.editorial is not None:
            libro.editorial = command.editorial
        if command.edicion is not None:
            libro.edicion = command.edicion
        if command.autor_ids is not None:
            for autor_id in command.autor_ids:
                if self.autor_repository.get_by_id(autor_id) is None:
                    raise ErrorHandler(ErrorType.AUTOR_NOT_FOUND)
            libro.autor_ids = command.autor_ids

        updated = self.libro_repository.update(command.id, libro)
        if updated is None:
            raise ErrorHandler(ErrorType.LIBRO_NOT_FOUND)

        return UpdateLibroUseCase.Result(libro=updated)
