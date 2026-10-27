from dataclasses import dataclass
from typing import Optional
from app.domain.entities.estado_socio import EstadoSocio


@dataclass
class Socio:
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    documento: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    estado: Optional[EstadoSocio] = None
