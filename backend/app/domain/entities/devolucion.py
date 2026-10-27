from dataclasses import dataclass
from datetime import date
from typing import Optional, Union
from app.domain.entities.estado_ejemplar import EstadoEjemplar


@dataclass
class Devolucion:
    fecha: Optional[Union[date, str]] = None
    observaciones: Optional[str] = None
    estadoDevuelto: Optional[EstadoEjemplar] = None
