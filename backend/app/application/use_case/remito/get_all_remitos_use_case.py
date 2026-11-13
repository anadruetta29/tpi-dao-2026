from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.remito import Remito
from app.domain.entity.rol import Rol
from app.domain.repository.remito_repository_i import RemitoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetAllRemitosUseCase:
    def __init__(
        self,
        remito_repository: RemitoRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.remito_repository = remito_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        sede_origen_id: Optional[int] = None
        sede_destino_id: Optional[int] = None
        estado: Optional[EstadoEnvio] = None

    @dataclass(frozen=True)
    class Result:
        remitos: List[Remito]

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        remitos = self.remito_repository.get_all_filtered(
            sede_origen_id=command.sede_origen_id,
            sede_destino_id=command.sede_destino_id,
            estado=command.estado,
        )
        return GetAllRemitosUseCase.Result(remitos=remitos)
