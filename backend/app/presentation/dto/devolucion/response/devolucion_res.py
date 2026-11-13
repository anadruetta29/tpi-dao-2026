from datetime import date
from typing import List, Optional, Union
from pydantic import BaseModel
from app.domain.entity.devolucion import Devolucion
from app.domain.entity.estado_ejemplar import EstadoEjemplar


class DevolucionRes(BaseModel):
    id: Optional[int] = None
    fecha: Optional[Union[date, str]] = None
    observaciones: Optional[str] = None
    estadoDevuelto: Optional[EstadoEjemplar] = None
    prestamo_id: Optional[int] = None

    @staticmethod
    def from_domain(devolucion: Devolucion) -> "DevolucionRes":
        return DevolucionRes(
            id=devolucion.id,
            fecha=devolucion.fecha,
            observaciones=devolucion.observaciones,
            estadoDevuelto=devolucion.estadoDevuelto,
            prestamo_id=devolucion.prestamo_id,
        )


class GetAllDevolucionesRes(BaseModel):
    devoluciones: List[DevolucionRes]

    @staticmethod
    def from_domain_list(devoluciones: List[Devolucion]) -> "GetAllDevolucionesRes":
        return GetAllDevolucionesRes(
            devoluciones=[DevolucionRes.from_domain(d) for d in devoluciones]
        )
