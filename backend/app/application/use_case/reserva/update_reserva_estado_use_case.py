from dataclasses import dataclass
from datetime import date
from typing import Callable, ContextManager, Optional
from app.application.helper.gestionar_retiro_reserva import GestionarRetiroReserva
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.reserva import Reserva
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.reserva_repository_i import ReservaRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class UpdateReservaEstadoUseCase:
    def __init__(
        self,
        reserva_repository: ReservaRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        retiro: GestionarRetiroReserva,
        transaction: Callable[[], ContextManager],
    ) -> None:
        self.reserva_repository = reserva_repository
        self.usuario_repository = usuario_repository
        self.retiro = retiro
        self.transaction = transaction

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]
        estado: Optional[EstadoReserva]

    @dataclass(frozen=True)
    class Result:
        reserva: Reserva

    def execute(self, command: Command) -> Result:
        with self.transaction():
            return self._execute(command)

    def _execute(self, command: Command) -> Result:
        usuario = AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.RECEPCIONISTA,
        )
        if command.id is None or command.estado is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        reserva = self.reserva_repository.get_by_id_for_update(command.id)
        if reserva is None:
            raise ErrorHandler(ErrorType.RESERVA_NOT_FOUND)

        usuario.validar_sede(reserva.sede_id)
        if command.estado == EstadoReserva.RETIRADA:
            return self.Result(reserva=self.retiro.retirar(reserva, date.today()))
        if command.estado == EstadoReserva.CANCELADA:
            return self.Result(reserva=self.retiro.liberar(reserva, command.estado, date.today()))
        raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)
