from dataclasses import dataclass
from typing import Optional
from app.domain.entities.tipo_prestamo import TipoPrestamo
from app.domain.entities.estado_solicitud import EstadoSolicitud


@dataclass
class SolicitudPrestamo:
    numero: Optional[str] = None
    tipo: Optional[TipoPrestamo] = None
    estado: Optional[EstadoSolicitud] = None
