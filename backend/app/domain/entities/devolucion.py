from datetime import date
from typing import Optional, Union
from app.domain.entities.estado_ejemplar import EstadoEjemplar


class Devolucion:
    def __init__(
        self,
        fecha: Optional[Union[date, str]] = None,
        observaciones: Optional[str] = None,
        estadoDevuelto: Optional[EstadoEjemplar] = None,
    ) -> None:
        self.fecha = fecha
        self.observaciones = observaciones
        self.estadoDevuelto = estadoDevuelto
