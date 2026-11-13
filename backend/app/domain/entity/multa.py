from datetime import date
from typing import Optional, Union
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.estado_multa import EstadoMulta


class Multa:
    def __init__(
        self,
        id: Optional[int] = None,
        fechaEmision: Optional[Union[date, str]] = None,
        motivo: Optional[MotivoMulta] = None,
        monto: Optional[float] = None,
        estado: Optional[EstadoMulta] = None,
        fechaPago: Optional[Union[date, str]] = None,
        socio_id: Optional[int] = None,
        prestamo_id: Optional[int] = None,
    ) -> None:
        self.id = id
        self.fechaEmision = fechaEmision
        self.motivo = motivo
        self.monto = monto
        self.estado = estado
        self.fechaPago = fechaPago
        self.socio_id = socio_id
        self.prestamo_id = prestamo_id
