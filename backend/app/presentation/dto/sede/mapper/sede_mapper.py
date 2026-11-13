from typing import Any, Dict, List, Optional
from app.domain.entity.estado_sede import EstadoSede
from app.domain.entity.sede import Sede
from app.presentation.dto.sede.request import (
    CreateSedeReq,
    DeleteSedeReq,
    GetAllSedesReq,
    GetSedeByIdReq,
    UpdateSedeReq,
)
from app.presentation.dto.sede.response import GetAllSedesRes, SedeRes


class SedeMapper:
    @staticmethod
    def to_get_all_request(token: Optional[str], estado: Optional[EstadoSede] = None) -> GetAllSedesReq:
        return GetAllSedesReq.build(token, estado)

    @staticmethod
    def to_get_all_response(sedes: List[Sede]) -> GetAllSedesRes:
        return GetAllSedesRes.from_domain_list(sedes)

    @staticmethod
    def to_get_by_id_request(token: Optional[str], id: int) -> GetSedeByIdReq:
        return GetSedeByIdReq.build(token, id)

    @staticmethod
    def to_create_request(token: Optional[str], payload: Dict[str, Any]) -> CreateSedeReq:
        return CreateSedeReq.build(token, payload)

    @staticmethod
    def to_update_request(token: Optional[str], id: int, payload: Dict[str, Any]) -> UpdateSedeReq:
        return UpdateSedeReq.build(token, id, payload)

    @staticmethod
    def to_delete_request(token: Optional[str], id: int) -> DeleteSedeReq:
        return DeleteSedeReq.build(token, id)

    @staticmethod
    def to_response(sede: Sede) -> SedeRes:
        return SedeRes.from_domain(sede)
