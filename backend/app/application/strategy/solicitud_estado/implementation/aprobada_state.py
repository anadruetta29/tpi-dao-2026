from typing import Optional
from app.application.strategy.solicitud_estado.core.solicitud_estado_state import (
    SolicitudEstadoState,
)
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class AprobadaState(SolicitudEstadoState):
    def aprobar(
        self,
        solicitud: SolicitudPrestamo,
        responsable_id: Optional[int],
        ejemplar: Optional[Ejemplar],
    ) -> None:
        raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)

    def rechazar(self, solicitud: SolicitudPrestamo) -> None:
        raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)

    def cancelar(self, solicitud: SolicitudPrestamo) -> None:
        solicitud.estado = EstadoSolicitud.CANCELADA
