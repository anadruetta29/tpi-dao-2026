from typing import Dict
from app.application.strategy.remito_estado.core.remito_estado_state import (
    RemitoEstadoState,
)
from app.application.strategy.remito_estado.implementation.con_incidencia_state import (
    ConIncidenciaState,
)
from app.application.strategy.remito_estado.implementation.despachado_state import (
    DespachadoState,
)
from app.application.strategy.remito_estado.implementation.empacado_state import (
    EmpacadoState,
)
from app.application.strategy.remito_estado.implementation.en_transito_state import (
    EnTransitoState,
)
from app.application.strategy.remito_estado.implementation.pendiente_envio_state import (
    PendienteEnvioState,
)
from app.application.strategy.remito_estado.implementation.recibido_state import (
    RecibidoState,
)
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class RemitoEstadoStateFactory:
    def __init__(self) -> None:
        self._states: Dict[EstadoEnvio, RemitoEstadoState] = {
            EstadoEnvio.PENDIENTE: PendienteEnvioState(),
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
