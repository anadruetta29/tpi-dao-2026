from dataclasses import dataclass
from datetime import date
from typing import Optional, Union
from app.domain.entities.motivo_multa import MotivoMulta
from app.domain.entities.estado_multa import EstadoMulta


@dataclass
class Multa:
    fechaEmision: Optional[Union[date, str]] = None
    motivo: Optional[MotivoMulta] = None
    monto: Optional[float] = None
    estado: Optional[EstadoMulta] = None
    fechaPago: Optional[Union[date, str]] = None
