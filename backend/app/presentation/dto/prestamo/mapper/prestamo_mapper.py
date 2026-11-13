from typing import Any, Dict, List, Optional
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.prestamo import Prestamo
from app.presentation.dto.prestamo.request import (
    CreatePrestamoReq,
    GetAllPrestamosReq,
    GetPrestamoByIdReq,
)
from app.presentation.dto.prestamo.response import GetAllPrestamosRes, PrestamoRes


class PrestamoMapper:
    @staticmethod
    def to_get_all_request(
        token: Optional[str],
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoPrestamo] = None,
    ) -> GetAllPrestamosReq:
        return GetAllPrestamosReq.build(token, socio_id, sede_id, estado)

    @staticmethod
    def to_get_all_response(prestamos: List[Prestamo]) -> GetAllPrestamosRes:
        return GetAllPrestamosRes.from_domain_list(prestamos)

    @staticmethod
    def to_get_by_id_request(token: Optional[str], id: int) -> GetPrestamoByIdReq:
        return GetPrestamoByIdReq.build(token, id)

    @staticmethod
    def to_create_request(token: Optional[str], payload: Dict[str, Any]) -> CreatePrestamoReq:
        return CreatePrestamoReq.build(token, payload)

    @staticmethod
    def to_response(prestamo: Prestamo) -> PrestamoRes:
        return PrestamoRes.from_domain(prestamo)
