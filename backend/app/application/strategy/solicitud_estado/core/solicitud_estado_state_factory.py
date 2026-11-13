from typing import Dict
from app.application.strategy.solicitud_estado.core.solicitud_estado_state import (
    SolicitudEstadoState,
)
from app.application.strategy.solicitud_estado.implementation.aprobada_state import (
    AprobadaState,
)
from app.application.strategy.solicitud_estado.implementation.cancelada_state import (
    CanceladaState,
)
from app.application.strategy.solicitud_estado.implementation.pendiente_state import (
    PendienteState,
)
from app.application.strategy.solicitud_estado.implementation.rechazada_state import (
    RechazadaState,
)
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class SolicitudEstadoStateFactory:
    def __init__(self) -> None:
        self._states: Dict[EstadoSolicitud, SolicitudEstadoState] = {
            EstadoSolicitud.PENDIENTE: PendienteState(),
            EstadoSolicitud.APROBADA: AprobadaState(),
            EstadoSolicitud.RECHAZADA: RechazadaState(),
            EstadoSolicitud.CANCELADA: CanceladaState(),
        }

    def get_state(self, estado: EstadoSolicitud) -> SolicitudEstadoState:
        state = self._states.get(estado)
        if state is None:
            raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)
        return state
