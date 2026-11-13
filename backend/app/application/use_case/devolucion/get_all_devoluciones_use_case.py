from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.devolucion import Devolucion
from app.domain.entity.rol import Rol
from app.domain.repository.devolucion_repository_i import DevolucionRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetAllDevolucionesUseCase:
    def __init__(
        self,
        devolucion_repository: DevolucionRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.devolucion_repository = devolucion_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]

    @dataclass(frozen=True)
    class Result:
        devoluciones: List[Devolucion]

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        devoluciones = self.devolucion_repository.get_all()
        return GetAllDevolucionesUseCase.Result(devoluciones=devoluciones)
