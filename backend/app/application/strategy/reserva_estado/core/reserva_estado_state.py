from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.reserva import Reserva
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class ReservaEstadoState:
    def atender(self, reserva: Reserva) -> None:
        raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)

    def cancelar(self, reserva: Reserva) -> None:
        raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)

    def vencer(self, reserva: Reserva) -> None:
        raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)

    def transicionar(self, reserva: Reserva, nuevo_estado: EstadoReserva) -> None:
        if nuevo_estado == EstadoReserva.ATENDIDA:
            self.atender(reserva)
        elif nuevo_estado == EstadoReserva.CANCELADA:
            self.cancelar(reserva)
        elif nuevo_estado == EstadoReserva.VENCIDA:
            self.vencer(reserva)
        else:
            raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)
