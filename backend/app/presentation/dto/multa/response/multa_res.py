from datetime import date
from typing import List, Optional, Union
from pydantic import BaseModel
from app.domain.entity.estado_multa import EstadoMulta
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.multa import Multa


class MultaRes(BaseModel):
    id: Optional[int] = None
    fechaEmision: Optional[Union[date, str]] = None
    motivo: Optional[MotivoMulta] = None
    monto: Optional[float] = None
    estado: Optional[EstadoMulta] = None
    fechaPago: Optional[Union[date, str]] = None
    socio_id: Optional[int] = None
    prestamo_id: Optional[int] = None

    @staticmethod
    def from_domain(multa: Multa) -> "MultaRes":
        return MultaRes(
            id=multa.id,
            fechaEmision=multa.fechaEmision,
            motivo=multa.motivo,
            monto=multa.monto,
            estado=multa.estado,
            fechaPago=multa.fechaPago,
            socio_id=multa.socio_id,
            prestamo_id=multa.prestamo_id,
        )


class GetAllMultasRes(BaseModel):
    multas: List[MultaRes]

    @staticmethod
    def from_domain_list(multas: List[Multa]) -> "GetAllMultasRes":
        return GetAllMultasRes(multas=[MultaRes.from_domain(m) for m in multas])
