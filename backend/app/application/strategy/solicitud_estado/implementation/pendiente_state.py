from typing import Optional
from app.application.strategy.ejemplar_estado.core.ejemplar_estado_state_factory import (
    EjemplarEstadoStateFactory,
)
from app.application.strategy.solicitud_estado.core.solicitud_estado_state import (
    SolicitudEstadoState,
)
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo


class PendienteState(SolicitudEstadoState):
    def __init__(self) -> None:
        self._ejemplar_state_factory = EjemplarEstadoStateFactory()

    def aprobar(
        self,
        solicitud: SolicitudPrestamo,
        responsable_id: Optional[int],
        ejemplar: Optional[Ejemplar],
    ) -> None:
        if ejemplar is not None:
            self._ejemplar_state_factory.get_state(ejemplar.estado).validar_prestamo(
                ejemplar
            )
        solicitud.responsable_destino_id = responsable_id
        solicitud.estado = EstadoSolicitud.APROBADA

    def rechazar(self, solicitud: SolicitudPrestamo) -> None:
        solicitud.estado = EstadoSolicitud.RECHAZADA

    def cancelar(self, solicitud: SolicitudPrestamo) -> None:
        solicitud.estado = EstadoSolicitud.CANCELADA
