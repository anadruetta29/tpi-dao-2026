from dataclasses import dataclass
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.reserva import Reserva
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.reserva_repository_i import ReservaRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetReservaByIdUseCase:
    def __init__(
        self,
        reserva_repository: ReservaRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.reserva_repository = reserva_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]

    @dataclass(frozen=True)
    class Result:
        reserva: Reserva

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

        reserva = self.reserva_repository.get_by_id(command.id)
        if reserva is None:
            raise ErrorHandler(ErrorType.RESERVA_NOT_FOUND)

        return GetReservaByIdUseCase.Result(reserva=reserva)
