from dataclasses import dataclass
from typing import Optional
from app.application.strategy.multa_estado.core.multa_estado_state_factory import (
    MultaEstadoStateFactory,
)
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_socio import EstadoSocio
from app.domain.entity.multa import Multa
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.multa_repository_i import MultaRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class AnularMultaUseCase:
    def __init__(
        self,
        multa_repository: MultaRepositoryI,
        socio_repository: SocioRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        multa_state_factory: Optional[MultaEstadoStateFactory] = None,
    ) -> None:
        self.multa_repository = multa_repository
        self.socio_repository = socio_repository
        self.usuario_repository = usuario_repository
        self.multa_state_factory = multa_state_factory or MultaEstadoStateFactory()

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]

    @dataclass(frozen=True)
    class Result:
        multa: Multa

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

        multa = self.multa_repository.get_by_id(command.id)
        if multa is None:
            raise ErrorHandler(ErrorType.MULTA_NOT_FOUND)

        state = self.multa_state_factory.get_state(multa.estado)
        state.anular(multa)
        updated = self.multa_repository.update(command.id, multa)
        if updated is None:
            raise ErrorHandler(ErrorType.MULTA_NOT_FOUND)

        if updated.socio_id is not None and not self.multa_repository.has_pending_by_socio(updated.socio_id):
            socio = self.socio_repository.get_by_id(updated.socio_id)
            if socio is not None and socio.id is not None:
                socio.estado = EstadoSocio.HABILITADO
                self.socio_repository.update(socio.id, socio)

        return AnularMultaUseCase.Result(multa=updated)
