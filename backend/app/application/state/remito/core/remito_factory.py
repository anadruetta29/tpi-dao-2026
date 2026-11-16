from typing import Dict
from app.application.state.remito.core.remito import (
    RemitoEstadoState,
)
from app.application.state.remito.implementation.aceptado import AceptadoState
from app.application.state.remito.implementation.con_incidencia import (
    ConIncidenciaState,
)
from app.application.state.remito.implementation.despachado import (
    DespachadoState,
)
from app.application.state.remito.implementation.empacado import (
    EmpacadoState,
)
from app.application.state.remito.implementation.en_transito import (
    EnTransitoState,
)
from app.application.state.remito.implementation.pendiente_envio import (
    PendienteEnvioState,
)
from app.application.state.remito.implementation.recibido import (
    RecibidoState,
)
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class RemitoEstadoStateFactory:
    def __init__(self) -> None:
        self._states: Dict[EstadoEnvio, RemitoEstadoState] = {
            EstadoEnvio.PENDIENTE: PendienteEnvioState(),
            EstadoEnvio.ACEPTADO: AceptadoState(),
            EstadoEnvio.EMPACADO: EmpacadoState(),
            EstadoEnvio.DESPACHADO: DespachadoState(),
            EstadoEnvio.EN_TRANSITO: EnTransitoState(),
            EstadoEnvio.RECIBIDO: RecibidoState(),
            EstadoEnvio.CON_INCIDENCIA: ConIncidenciaState(),
        }

    def get_state(self, estado: EstadoEnvio) -> RemitoEstadoState:
        state = self._states.get(estado)
        if state is None:
            raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)
        return state
