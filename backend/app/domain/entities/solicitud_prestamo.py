from typing import Optional
from app.domain.entities.tipo_prestamo import TipoPrestamo
from app.domain.entities.estado_solicitud import EstadoSolicitud


class SolicitudPrestamo:
    def __init__(
        self,
        numero: Optional[str] = None,
        tipo: Optional[TipoPrestamo] = None,
        estado: Optional[EstadoSolicitud] = None,
    ) -> None:
        self.numero = numero
        self.tipo = tipo
        self.estado = estado
