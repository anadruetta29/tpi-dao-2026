from datetime import date
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class AvisoRes(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tipo: str
    mensaje: str
    fecha: date
    leido: bool
    sede_id: Optional[int] = None
    socio_id: Optional[int] = None
    reserva_id: Optional[int] = None
    prestamo_id: Optional[int] = None


class GetAllAvisosRes(BaseModel):
    avisos: List[AvisoRes]
