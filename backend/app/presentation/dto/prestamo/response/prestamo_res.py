from datetime import date
from typing import List, Optional, Union
from pydantic import BaseModel
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.modalidad_prestamo_local import ModalidadPrestamoLocal
from app.domain.entity.prestamo import Prestamo


class PrestamoRes(BaseModel):
    id: Optional[int] = None
    fechaInicio: Optional[Union[date, str]] = None
    fechaVencimiento: Optional[Union[date, str]] = None
    fechaDevolucion: Optional[Union[date, str]] = None
    estado: Optional[EstadoPrestamo] = None
    modalidad: Optional[ModalidadPrestamoLocal] = None
    solicitud_id: Optional[int] = None
    socio_id: Optional[int] = None
    sede_id: Optional[int] = None
    ejemplar_id: Optional[int] = None

    @staticmethod
    def from_domain(prestamo: Prestamo) -> "PrestamoRes":
        return PrestamoRes(
            id=prestamo.id,
            fechaInicio=prestamo.fechaInicio,
            fechaVencimiento=prestamo.fechaVencimiento,
            fechaDevolucion=prestamo.fechaDevolucion,
            estado=prestamo.estado,
            modalidad=prestamo.modalidad,
            solicitud_id=prestamo.solicitud_id,
            socio_id=prestamo.socio_id,
            sede_id=prestamo.sede_id,
            ejemplar_id=prestamo.ejemplar_id,
        )


class GetAllPrestamosRes(BaseModel):
    prestamos: List[PrestamoRes]

    @staticmethod
    def from_domain_list(prestamos: List[Prestamo]) -> "GetAllPrestamosRes":
        return GetAllPrestamosRes(prestamos=[PrestamoRes.from_domain(p) for p in prestamos])
