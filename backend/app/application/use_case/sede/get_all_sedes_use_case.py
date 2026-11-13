from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_sede import EstadoSede
from app.domain.entity.rol import Rol
from app.domain.entity.sede import Sede
from app.domain.repository.sede_repository_i import SedeRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetAllSedesUseCase:
    def __init__(
        self,
        sede_repository: SedeRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.sede_repository = sede_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        estado: Optional[EstadoSede] = None

    @dataclass(frozen=True)
    class Result:
        sedes: List[Sede]

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        sedes = self.sede_repository.get_all_filtered(estado=command.estado)
        return GetAllSedesUseCase.Result(sedes=sedes)
