from dataclasses import dataclass
from typing import Optional
from app.domain.entities.estado_sede import EstadoSede


@dataclass
class Sede:
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    horarioAtencion: Optional[str] = None
    estado: Optional[EstadoSede] = None
