from typing import Dict
from app.application.state.multa.core.multa import (
    MultaEstadoState,
)
from app.application.state.multa.implementation.anulada_multa import (
    AnuladaMultaState,
)
from app.application.state.multa.implementation.pagada_multa import (
    PagadaMultaState,
)
from app.application.state.multa.implementation.pendiente_multa import (
    PendienteMultaState,
)
from app.domain.entity.estado_multa import EstadoMulta
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class MultaEstadoStateFactory:
    def __init__(self) -> None:
        self._states: Dict[EstadoMulta, MultaEstadoState] = {
            EstadoMulta.PENDIENTE: PendienteMultaState(),
            EstadoMulta.PAGADA: PagadaMultaState(),
            EstadoMulta.ANULADA: AnuladaMultaState(),
        }

    def get_state(self, estado: EstadoMulta) -> MultaEstadoState:
        state = self._states.get(estado)
        if state is None:
            raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)
        return state
