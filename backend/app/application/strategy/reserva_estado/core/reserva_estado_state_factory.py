from typing import Dict
from app.application.strategy.reserva_estado.core.reserva_estado_state import (
    ReservaEstadoState,
)
from app.application.strategy.reserva_estado.implementation.activa_reserva_state import (
    ActivaReservaState,
)
from app.application.strategy.reserva_estado.implementation.atendida_reserva_state import (
    AtendidaReservaState,
)
from app.application.strategy.reserva_estado.implementation.cancelada_reserva_state import (
    CanceladaReservaState,
)
from app.application.strategy.reserva_estado.implementation.vencida_reserva_state import (
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
            EstadoReserva.CANCELADA: CanceladaReservaState(),
            EstadoReserva.VENCIDA: VencidaReservaState(),
        }

    def get_state(self, estado: EstadoReserva) -> ReservaEstadoState:
        state = self._states.get(estado)
        if state is None:
            raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)
        return state
