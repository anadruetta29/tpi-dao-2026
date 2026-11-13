from datetime import date
from typing import Optional, Union
from app.domain.entity.estado_envio import EstadoEnvio


class HistorialEstadoRemito:
    def __init__(
        self,
        id: Optional[int] = None,
        fechaInicio: Optional[Union[date, str]] = None,
        fechaFin: Optional[Union[date, str]] = None,
        estado: Optional[EstadoEnvio] = None,
        remito_id: Optional[int] = None,
    ) -> None:
        self.id = id
        self.fechaInicio = fechaInicio
        self.fechaFin = fechaFin
        self.estado = estado
        self.remito_id = remito_id
