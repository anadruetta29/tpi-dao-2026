from dataclasses import dataclass
from typing import Optional
from app.domain.entities.estado_ejemplar import EstadoEjemplar


@dataclass
class Ejemplar:
    codigo: Optional[str] = None
    estado: Optional[EstadoEjemplar] = None
