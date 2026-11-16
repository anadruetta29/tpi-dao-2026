from abc import ABC, abstractmethod
from typing import Optional
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class SolicitudEstadoState(ABC):
    @abstractmethod
    def aprobar(
        self,
        solicitud: SolicitudPrestamo,
        responsable_id: Optional[int],
        ejemplar: Optional[Ejemplar],
    ) -> None:
        pass

    @abstractmethod
    def rechazar(self, solicitud: SolicitudPrestamo) -> None:
        pass

    @abstractmethod
    def cancelar(self, solicitud: SolicitudPrestamo) -> None:
        pass

    def transicionar(
        self,
        solicitud: SolicitudPrestamo,
        nuevo_estado: EstadoSolicitud,
        responsable_id: Optional[int],
        ejemplar: Optional[Ejemplar],
    ) -> None:
        if nuevo_estado == EstadoSolicitud.APROBADA:
            self.aprobar(solicitud, responsable_id, ejemplar)
        elif nuevo_estado == EstadoSolicitud.RECHAZADA:
            self.rechazar(solicitud)
        elif nuevo_estado == EstadoSolicitud.CANCELADA:
            self.cancelar(solicitud)
        else:
            raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)
