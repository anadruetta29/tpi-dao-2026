from typing import Dict
from app.application.state.solicitud.core.solicitud import (
    SolicitudEstadoState,
)
from app.application.state.solicitud.implementation.aprobada import (
    AprobadaState,
)
from app.application.state.solicitud.implementation.cancelada import (
    CanceladaState,
)
from app.application.state.solicitud.implementation.pendiente import (
    PendienteState,
)
from app.application.state.solicitud.implementation.rechazada import (
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
