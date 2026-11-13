from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.rol import Rol
from app.domain.entity.usuario import Usuario
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetAllUsuariosUseCase:
    def __init__(self, usuario_repository: UsuarioRepositoryI) -> None:
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        role: Optional[Rol] = None
        activo: Optional[bool] = None

    @dataclass(frozen=True)
    class Result:
        usuarios: List[Usuario]

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(command.token, self.usuario_repository, Rol.ADMIN)
        usuarios = self.usuario_repository.get_all_filtered(role=command.role, activo=command.activo)
        return GetAllUsuariosUseCase.Result(usuarios=usuarios)
