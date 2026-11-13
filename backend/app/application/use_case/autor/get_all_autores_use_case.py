from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.autor import Autor
from app.domain.entity.rol import Rol
from app.domain.repository.autor_repository_i import AutorRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetAllAutoresUseCase:
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

    @dataclass(frozen=True)
    class Result:
        autores: List[Autor]

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        autores = self.autor_repository.get_all()
        return GetAllAutoresUseCase.Result(autores=autores)
