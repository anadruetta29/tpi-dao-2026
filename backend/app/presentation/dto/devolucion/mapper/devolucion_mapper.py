from typing import Any, Dict, List, Optional
from app.domain.entity.devolucion import Devolucion
from app.presentation.dto.devolucion.request import (
    CreateDevolucionReq,
    GetAllDevolucionesReq,
    GetDevolucionByIdReq,
)
from app.presentation.dto.devolucion.response import DevolucionRes, GetAllDevolucionesRes


class DevolucionMapper:
    @staticmethod
    def to_get_all_request(token: Optional[str]) -> GetAllDevolucionesReq:
        return GetAllDevolucionesReq.build(token)

    @staticmethod
    def to_get_all_response(devoluciones: List[Devolucion]) -> GetAllDevolucionesRes:
        return GetAllDevolucionesRes.from_domain_list(devoluciones)

    @staticmethod
    def to_get_by_id_request(token: Optional[str], id: int) -> GetDevolucionByIdReq:
        return GetDevolucionByIdReq.build(token, id)

    @staticmethod
    def to_create_request(token: Optional[str], payload: Dict[str, Any]) -> CreateDevolucionReq:
        return CreateDevolucionReq.build(token, payload)

    @staticmethod
    def to_response(devolucion: Devolucion) -> DevolucionRes:
        return DevolucionRes.from_domain(devolucion)
