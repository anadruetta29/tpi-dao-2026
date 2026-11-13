from typing import Any, Dict, List, Optional
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.presentation.dto.solicitud_prestamo.request import (
    CreateSolicitudInterbibliotecariaReq,
    CreateSolicitudLocalReq,
    GetAllSolicitudesPrestamoReq,
    GetSolicitudPrestamoByIdReq,
    UpdateSolicitudEstadoReq,
)
from app.presentation.dto.solicitud_prestamo.response import (
    GetAllSolicitudesPrestamoRes,
    SolicitudPrestamoRes,
)


class SolicitudPrestamoMapper:
    @staticmethod
    def to_get_all_request(
        token: Optional[str],
        tipo: Optional[TipoPrestamo] = None,
        estado: Optional[EstadoSolicitud] = None,
        sede_id: Optional[int] = None,
    ) -> GetAllSolicitudesPrestamoReq:
        return GetAllSolicitudesPrestamoReq.build(token, tipo, estado, sede_id)

    @staticmethod
    def to_get_all_response(solicitudes: List[SolicitudPrestamo]) -> GetAllSolicitudesPrestamoRes:
        return GetAllSolicitudesPrestamoRes.from_domain_list(solicitudes)

    @staticmethod
    def to_get_by_id_request(token: Optional[str], id: int) -> GetSolicitudPrestamoByIdReq:
        return GetSolicitudPrestamoByIdReq.build(token, id)

    @staticmethod
    def to_create_local_request(token: Optional[str], payload: Dict[str, Any]) -> CreateSolicitudLocalReq:
        return CreateSolicitudLocalReq.build(token, payload)

    @staticmethod
    def to_create_interbibliotecaria_request(
        token: Optional[str], payload: Dict[str, Any]
    ) -> CreateSolicitudInterbibliotecariaReq:
        return CreateSolicitudInterbibliotecariaReq.build(token, payload)

    @staticmethod
    def to_update_estado_request(
        token: Optional[str], id: int, payload: Dict[str, Any]
    ) -> UpdateSolicitudEstadoReq:
        return UpdateSolicitudEstadoReq.build(token, id, payload)

    @staticmethod
    def to_response(solicitud: SolicitudPrestamo) -> SolicitudPrestamoRes:
        return SolicitudPrestamoRes.from_domain(solicitud)
