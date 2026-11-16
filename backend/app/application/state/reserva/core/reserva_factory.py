from typing import Dict
from app.application.state.reserva.core.reserva import (
    ReservaEstadoState,
)
from app.application.state.reserva.implementation.activa_reserva import (
    ActivaReservaState,
)
from app.application.state.reserva.implementation.atendida_reserva import (
    AtendidaReservaState,
)
from app.application.state.reserva.implementation.lista_para_retiro_reserva import (
    ListaParaRetiroReservaState,
)
from app.application.state.reserva.implementation.cancelada_reserva import (
    CanceladaReservaState,
)
from app.application.state.reserva.implementation.vencida_reserva import (
    VencidaReservaState,
)
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class ReservaEstadoStateFactory:
    def __init__(self) -> None:
        self._states: Dict[EstadoReserva, ReservaEstadoState] = {
            EstadoReserva.ACTIVA: ActivaReservaState(),
            EstadoReserva.ATENDIDA: AtendidaReservaState(),
            EstadoReserva.LISTA_PARA_RETIRO: ListaParaRetiroReservaState(),
            EstadoReserva.RETIRADA: AtendidaReservaState(),
            EstadoReserva.CANCELADA: CanceladaReservaState(),
            EstadoReserva.VENCIDA: VencidaReservaState(),
        }

    def get_state(self, estado: EstadoReserva) -> ReservaEstadoState:
        state = self._states.get(estado)
        if state is None:
            raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)
        return state
