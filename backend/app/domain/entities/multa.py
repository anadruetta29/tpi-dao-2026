from datetime import date
from typing import Optional, Union
from app.domain.entities.motivo_multa import MotivoMulta
from app.domain.entities.estado_multa import EstadoMulta


class Multa:
    def __init__(
        self,
        fechaEmision: Optional[Union[date, str]] = None,
        motivo: Optional[MotivoMulta] = None,
        monto: Optional[float] = None,
        estado: Optional[EstadoMulta] = None,
        fechaPago: Optional[Union[date, str]] = None,
    ) -> None:
        self.fechaEmision = fechaEmision
        self.motivo = motivo
        self.monto = monto
        self.estado = estado
        self.fechaPago = fechaPago
