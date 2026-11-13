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


class CreateLibroUseCase:
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
        titulo: Optional[str]
        añoPublicacion: Optional[int]
        editorial: Optional[str]
        edicion: Optional[str]
        autor_ids: List[int]

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
        if not command.titulo or not command.editorial:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        for autor_id in command.autor_ids:
            if self.autor_repository.get_by_id(autor_id) is None:
                raise ErrorHandler(ErrorType.AUTOR_NOT_FOUND)

        libro = Libro(
            titulo=command.titulo,
            añoPublicacion=command.añoPublicacion,
            editorial=command.editorial,
            edicion=command.edicion,
            autor_ids=command.autor_ids,
        )
        saved = self.libro_repository.save(libro)
        return CreateLibroUseCase.Result(libro=saved)
