from typing import Optional
from app.application.state.ejemplar.core.ejemplar_factory import (
    EjemplarEstadoStateFactory,
)
from app.application.state.solicitud.core.solicitud import (
    SolicitudEstadoState,
)
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.entity.tipo_prestamo import TipoPrestamo


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
        if solicitud.tipo != TipoPrestamo.INTERBIBLIOTECARIO:
            solicitud.responsable_destino_id = responsable_id
        solicitud.estado = EstadoSolicitud.APROBADA

    def rechazar(self, solicitud: SolicitudPrestamo) -> None:
        solicitud.estado = EstadoSolicitud.RECHAZADA

    def cancelar(self, solicitud: SolicitudPrestamo) -> None:
        solicitud.estado = EstadoSolicitud.CANCELADA
