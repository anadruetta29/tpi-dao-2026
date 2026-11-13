from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.multa import Multa
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.multa_repository_i import MultaRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetSocioMultasUseCase:
    def __init__(
        self,
        socio_repository: SocioRepositoryI,
        multa_repository: MultaRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.socio_repository = socio_repository
        self.multa_repository = multa_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]

    @dataclass(frozen=True)
    class Result:
        socio_id: int
        multas: List[Multa]

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        if command.id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        socio = self.socio_repository.get_by_id(command.id)
        if socio is None:
            raise ErrorHandler(ErrorType.SOCIO_NOT_FOUND)

        multas = self.multa_repository.get_all_filtered(socio_id=command.id)
        return GetSocioMultasUseCase.Result(socio_id=command.id, multas=multas)
