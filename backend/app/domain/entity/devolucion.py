from datetime import date
from typing import Optional, Union
from app.domain.entity.estado_ejemplar import EstadoEjemplar


class Devolucion:
    def __init__(
        self,
        id: Optional[int] = None,
        fecha: Optional[Union[date, str]] = None,
        observaciones: Optional[str] = None,
        estadoDevuelto: Optional[EstadoEjemplar] = None,
        prestamo_id: Optional[int] = None,
    ) -> None:
        self.id = id
        self.fecha = fecha
        self.observaciones = observaciones
        self.estadoDevuelto = estadoDevuelto
        self.prestamo_id = prestamo_id
