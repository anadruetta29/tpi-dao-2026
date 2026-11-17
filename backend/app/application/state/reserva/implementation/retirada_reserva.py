from app.application.state.reserva.core.reserva import ReservaEstadoState
from app.domain.entity.reserva import Reserva
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class RetiradaReservaState(ReservaEstadoState):
    def atender(self, reserva: Reserva) -> None:
        raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)

    def retirar(self, reserva: Reserva) -> None:
        raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)

    def cancelar(self, reserva: Reserva) -> None:
        raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)

    def vencer(self, reserva: Reserva) -> None:
        raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)
