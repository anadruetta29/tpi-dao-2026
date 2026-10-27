from datetime import date
from typing import Optional, Union
from app.domain.entities.estado_envio import EstadoEnvio


class HistorialEstadoRemito:
    def __init__(
        self,
        fechaInicio: Optional[Union[date, str]] = None,
        fechaFin: Optional[Union[date, str]] = None,
        estado: Optional[EstadoEnvio] = None,
    ) -> None:
        self.fechaInicio = fechaInicio
        self.fechaFin = fechaFin
        self.estado = estado
