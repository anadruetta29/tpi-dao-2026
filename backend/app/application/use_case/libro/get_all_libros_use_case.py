from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.libro import Libro
from app.domain.entity.rol import Rol
from app.domain.repository.libro_repository_i import LibroRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetAllLibrosUseCase:
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
        titulo: Optional[str] = None
        autor: Optional[str] = None
        editorial: Optional[str] = None

    @dataclass(frozen=True)
    class Result:
        libros: List[Libro]

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        libros = self.libro_repository.get_all_filtered(
            titulo=command.titulo,
            autor=command.autor,
            editorial=command.editorial,
        )
        return GetAllLibrosUseCase.Result(libros=libros)
