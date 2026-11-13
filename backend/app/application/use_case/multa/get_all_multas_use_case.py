from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_multa import EstadoMulta
from app.domain.entity.multa import Multa
from app.domain.entity.rol import Rol
from app.domain.repository.multa_repository_i import MultaRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetAllMultasUseCase:
    def __init__(
        self,
        multa_repository: MultaRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.multa_repository = multa_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        socio_id: Optional[int] = None
        estado: Optional[EstadoMulta] = None

    @dataclass(frozen=True)
    class Result:
        multas: List[Multa]

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        multas = self.multa_repository.get_all_filtered(
            socio_id=command.socio_id,
            estado=command.estado,
        )
        return GetAllMultasUseCase.Result(multas=multas)
