from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.rol import Rol
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetAllEjemplaresUseCase:
    def __init__(
        self,
        ejemplar_repository: EjemplarRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        libro_id: Optional[int] = None
        sede_id: Optional[int] = None
        estado: Optional[EstadoEjemplar] = None

    @dataclass(frozen=True)
    class Result:
        ejemplares: List[Ejemplar]

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        ejemplares = self.ejemplar_repository.get_all_filtered(
            libro_id=command.libro_id,
            sede_id=command.sede_id,
            estado=command.estado,
        )
        return GetAllEjemplaresUseCase.Result(ejemplares=ejemplares)
