from app.application.state.reserva.core.reserva import ReservaEstadoState
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.reserva import Reserva
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class ActivaReservaState(ReservaEstadoState):
    def atender(self, reserva: Reserva) -> None:
        reserva.estado = EstadoReserva.LISTA_PARA_RETIRO

    def retirar(self, reserva: Reserva) -> None:
        raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)

    def cancelar(self, reserva: Reserva) -> None:
        reserva.estado = EstadoReserva.CANCELADA

    def vencer(self, reserva: Reserva) -> None:
        reserva.estado = EstadoReserva.VENCIDA
