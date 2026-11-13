from datetime import date
from typing import List, Optional, Union
from pydantic import BaseModel
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.reserva import Reserva


class ReservaRes(BaseModel):
    id: Optional[int] = None
    fecha: Optional[Union[date, str]] = None
    estado: Optional[EstadoReserva] = None
    socio_id: Optional[int] = None
    libro_id: Optional[int] = None
    sede_id: Optional[int] = None
    ejemplar_id: Optional[int] = None

    @staticmethod
    def from_domain(reserva: Reserva) -> "ReservaRes":
        return ReservaRes(
            id=reserva.id,
            fecha=reserva.fecha,
            estado=reserva.estado,
            socio_id=reserva.socio_id,
            libro_id=reserva.libro_id,
            sede_id=reserva.sede_id,
            ejemplar_id=reserva.ejemplar_id,
        )


class GetAllReservasRes(BaseModel):
    reservas: List[ReservaRes]

    @staticmethod
    def from_domain_list(reservas: List[Reserva]) -> "GetAllReservasRes":
        return GetAllReservasRes(reservas=[ReservaRes.from_domain(r) for r in reservas])
