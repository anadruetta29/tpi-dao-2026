from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.aviso import Aviso
from app.domain.entity.rol import Rol
from app.domain.repository.aviso_repository_i import AvisoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetAllAvisosUseCase:
    def __init__(
        self,
        aviso_repository: AvisoRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.aviso_repository = aviso_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]

    @dataclass(frozen=True)
    class Result:
        avisos: List[Aviso]

    def execute(self, command: Command) -> Result:
        usuario = AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.RECEPCIONISTA,
        )
        avisos = self.aviso_repository.listar(usuario.id, usuario.sede_recepcionista())
        return GetAllAvisosUseCase.Result(avisos=avisos)
