from app.application.strategy.reserva_estado.core.reserva_estado_state import ReservaEstadoState
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.reserva import Reserva


class ListaParaRetiroReservaState(ReservaEstadoState):
    def cancelar(self, reserva: Reserva) -> None:
        reserva.estado = EstadoReserva.CANCELADA

    def vencer(self, reserva: Reserva) -> None:
        reserva.estado = EstadoReserva.VENCIDA

    def retirar(self, reserva: Reserva) -> None:
        reserva.estado = EstadoReserva.RETIRADA
