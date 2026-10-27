from datetime import date
from typing import Optional, Union
from app.domain.entities.estado_reserva import EstadoReserva


class Reserva:
    def __init__(
        self,
        fecha: Optional[Union[date, str]] = None,
        estado: Optional[EstadoReserva] = None,
    ) -> None:
        self.fecha = fecha
        self.estado = estado
