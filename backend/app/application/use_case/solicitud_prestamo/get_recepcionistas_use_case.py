from dataclasses import dataclass
from typing import Optional

from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.rol import Rol
from app.domain.entity.usuario import Usuario
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetRecepcionistasUseCase:
    def __init__(self, repository: UsuarioRepositoryI) -> None:
        self.repository = repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]

    @dataclass(frozen=True)
    class Result:
        recepcionistas: list[Usuario]

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(command.token, self.repository, Rol.ADMIN, Rol.RECEPCIONISTA)
        return self.Result(self.repository.get_all_filtered(role=Rol.RECEPCIONISTA, activo=True))
