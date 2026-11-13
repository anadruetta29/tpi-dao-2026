from typing import List, Optional
from pydantic import BaseModel
from app.domain.entity.estado_sede import EstadoSede
from app.domain.entity.sede import Sede


class SedeRes(BaseModel):
    id: Optional[int] = None
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    horarioAtencion: Optional[str] = None
    estado: Optional[EstadoSede] = None

    @staticmethod
    def from_domain(sede: Sede) -> "SedeRes":
        return SedeRes(
            id=sede.id,
            nombre=sede.nombre,
            telefono=sede.telefono,
            email=sede.email,
            horarioAtencion=sede.horarioAtencion,
            estado=sede.estado,
        )


class GetAllSedesRes(BaseModel):
    sedes: List[SedeRes]

    @staticmethod
    def from_domain_list(sedes: List[Sede]) -> "GetAllSedesRes":
        return GetAllSedesRes(sedes=[SedeRes.from_domain(s) for s in sedes])
