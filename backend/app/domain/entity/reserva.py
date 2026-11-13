from datetime import date
from typing import Optional, Union
from app.domain.entity.estado_reserva import EstadoReserva


class Reserva:
    def __init__(
        self,
        id: Optional[int] = None,
        fecha: Optional[Union[date, str]] = None,
        estado: Optional[EstadoReserva] = None,
        socio_id: Optional[int] = None,
        libro_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        ejemplar_id: Optional[int] = None,
    ) -> None:
        self.id = id
        self.fecha = fecha
        self.estado = estado
        self.socio_id = socio_id
        self.libro_id = libro_id
        self.sede_id = sede_id
        self.ejemplar_id = ejemplar_id
