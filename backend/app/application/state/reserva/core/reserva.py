from abc import ABC, abstractmethod
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.reserva import Reserva
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class ReservaEstadoState(ABC):
    @abstractmethod
    def atender(self, reserva: Reserva) -> None:
        pass

    @abstractmethod
    def retirar(self, reserva: Reserva) -> None:
        pass

    @abstractmethod
    def cancelar(self, reserva: Reserva) -> None:
        pass

    @abstractmethod
    def vencer(self, reserva: Reserva) -> None:
        pass

    def transicionar(self, reserva: Reserva, nuevo_estado: EstadoReserva) -> None:
        if nuevo_estado == EstadoReserva.LISTA_PARA_RETIRO:
            self.atender(reserva)
        elif nuevo_estado == EstadoReserva.RETIRADA:
            self.retirar(reserva)
        elif nuevo_estado == EstadoReserva.CANCELADA:
            self.cancelar(reserva)
        elif nuevo_estado == EstadoReserva.VENCIDA:
            self.vencer(reserva)
        else:
            raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)
