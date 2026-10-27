from dataclasses import dataclass
from datetime import date
from typing import Optional, Union
from app.domain.entities.estado_reserva import EstadoReserva


@dataclass
class Reserva:
    fecha: Optional[Union[date, str]] = None
    estado: Optional[EstadoReserva] = None
