from typing import List, Optional
from pydantic import BaseModel
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.entity.tipo_prestamo import TipoPrestamo


class SolicitudPrestamoRes(BaseModel):
    id: Optional[int] = None
    numero: Optional[str] = None
    tipo: Optional[TipoPrestamo] = None
    estado: Optional[EstadoSolicitud] = None
    socio_id: Optional[int] = None
    ejemplar_id: Optional[int] = None
    sede_origen_id: Optional[int] = None
    sede_destino_id: Optional[int] = None
    responsable_origen_id: Optional[int] = None
    responsable_destino_id: Optional[int] = None

    @staticmethod
    def from_domain(solicitud: SolicitudPrestamo) -> "SolicitudPrestamoRes":
        return SolicitudPrestamoRes(
            id=solicitud.id,
            numero=solicitud.numero,
            tipo=solicitud.tipo,
            estado=solicitud.estado,
            socio_id=solicitud.socio_id,
            ejemplar_id=solicitud.ejemplar_id,
            sede_origen_id=solicitud.sede_origen_id,
            sede_destino_id=solicitud.sede_destino_id,
            responsable_origen_id=solicitud.responsable_origen_id,
            responsable_destino_id=solicitud.responsable_destino_id,
        )


class GetAllSolicitudesPrestamoRes(BaseModel):
    solicitudes: List[SolicitudPrestamoRes]

    @staticmethod
    def from_domain_list(solicitudes: List[SolicitudPrestamo]) -> "GetAllSolicitudesPrestamoRes":
        return GetAllSolicitudesPrestamoRes(
            solicitudes=[SolicitudPrestamoRes.from_domain(s) for s in solicitudes]
        )
