from datetime import date
from typing import List, Optional, Union
from pydantic import BaseModel
from app.domain.entity.estado_multa import EstadoMulta
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.estado_socio import EstadoSocio
from app.domain.entity.modalidad_prestamo_local import ModalidadPrestamoLocal
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.multa import Multa
from app.domain.entity.prestamo import Prestamo
from app.domain.entity.socio import Socio


class SocioRes(BaseModel):
    id: Optional[int] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    documento: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    estado: Optional[EstadoSocio] = None

    @staticmethod
    def from_domain(socio: Socio) -> "SocioRes":
        return SocioRes(
            id=socio.id,
            nombre=socio.nombre,
            apellido=socio.apellido,
            documento=socio.documento,
            email=socio.email,
            telefono=socio.telefono,
            estado=socio.estado,
        )


class GetAllSociosRes(BaseModel):
    socios: List[SocioRes]

    @staticmethod
    def from_domain_list(socios: List[Socio]) -> "GetAllSociosRes":
        return GetAllSociosRes(socios=[SocioRes.from_domain(s) for s in socios])


class SocioPrestamoItemRes(BaseModel):
    id: Optional[int] = None
    fechaInicio: Optional[Union[date, str]] = None
    fechaVencimiento: Optional[Union[date, str]] = None
    fechaDevolucion: Optional[Union[date, str]] = None
    estado: Optional[EstadoPrestamo] = None
    modalidad: Optional[ModalidadPrestamoLocal] = None
    solicitud_id: Optional[int] = None
    sede_id: Optional[int] = None
    ejemplar_id: Optional[int] = None

    @staticmethod
    def from_domain(prestamo: Prestamo) -> "SocioPrestamoItemRes":
        return SocioPrestamoItemRes(
            id=prestamo.id,
            fechaInicio=prestamo.fechaInicio,
            fechaVencimiento=prestamo.fechaVencimiento,
            fechaDevolucion=prestamo.fechaDevolucion,
            estado=prestamo.estado,
            modalidad=prestamo.modalidad,
            solicitud_id=prestamo.solicitud_id,
            sede_id=prestamo.sede_id,
            ejemplar_id=prestamo.ejemplar_id,
        )


class GetSocioPrestamosRes(BaseModel):
    socio_id: int
    prestamos: List[SocioPrestamoItemRes]

    @staticmethod
    def from_domain_list(socio_id: int, prestamos: List[Prestamo]) -> "GetSocioPrestamosRes":
        return GetSocioPrestamosRes(
            socio_id=socio_id,
            prestamos=[SocioPrestamoItemRes.from_domain(p) for p in prestamos],
        )


class SocioMultaItemRes(BaseModel):
    id: Optional[int] = None
    fechaEmision: Optional[Union[date, str]] = None
    motivo: Optional[MotivoMulta] = None
    monto: Optional[float] = None
    estado: Optional[EstadoMulta] = None
    fechaPago: Optional[Union[date, str]] = None
    prestamo_id: Optional[int] = None

    @staticmethod
    def from_domain(multa: Multa) -> "SocioMultaItemRes":
        return SocioMultaItemRes(
            id=multa.id,
            fechaEmision=multa.fechaEmision,
            motivo=multa.motivo,
            monto=multa.monto,
            estado=multa.estado,
            fechaPago=multa.fechaPago,
            prestamo_id=multa.prestamo_id,
        )


class GetSocioMultasRes(BaseModel):
    socio_id: int
    multas: List[SocioMultaItemRes]

    @staticmethod
    def from_domain_list(socio_id: int, multas: List[Multa]) -> "GetSocioMultasRes":
        return GetSocioMultasRes(
            socio_id=socio_id,
            multas=[SocioMultaItemRes.from_domain(m) for m in multas],
        )
