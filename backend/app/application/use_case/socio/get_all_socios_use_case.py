from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_socio import EstadoSocio
from app.domain.entity.rol import Rol
from app.domain.entity.socio import Socio
from app.domain.repository.socio_repository_i import SocioRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetAllSociosUseCase:
    def __init__(
        self,
        socio_repository: SocioRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.socio_repository = socio_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        q: Optional[str] = None
        documento: Optional[str] = None
        estado: Optional[EstadoSocio] = None

    @dataclass(frozen=True)
    class Result:
        socios: List[Socio]

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        socios = self.socio_repository.get_all_filtered(
            q=command.q,
            documento=command.documento,
            estado=command.estado,
        )
        return GetAllSociosUseCase.Result(socios=socios)
