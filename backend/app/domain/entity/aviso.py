from dataclasses import dataclass
from datetime import date
from typing import Optional


@dataclass
class Aviso:
    clave: str
    tipo: str
    mensaje: str
    fecha: date
    sede_id: Optional[int] = None
    socio_id: Optional[int] = None
    reserva_id: Optional[int] = None
    prestamo_id: Optional[int] = None
    id: Optional[int] = None
    leido: bool = False
