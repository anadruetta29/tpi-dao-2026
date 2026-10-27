from dataclasses import dataclass
from datetime import date
from typing import Optional, Union
from app.domain.entities.estado_envio import EstadoEnvio


@dataclass
class HistorialEstadoRemito:
    fechaInicio: Optional[Union[date, str]] = None
    fechaFin: Optional[Union[date, str]] = None
    estado: Optional[EstadoEnvio] = None
