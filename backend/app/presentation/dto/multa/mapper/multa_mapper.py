from typing import Any, Dict, List, Optional
from app.domain.entity.estado_multa import EstadoMulta
from app.domain.entity.multa import Multa
from app.presentation.dto.multa.request import (
    CreateMultaReq,
    GetAllMultasReq,
    GetMultaByIdReq,
    MultaActionReq,
)
from app.presentation.dto.multa.response import GetAllMultasRes, MultaRes


class MultaMapper:
    @staticmethod
    def to_get_all_request(
        token: Optional[str],
        socio_id: Optional[int] = None,
        estado: Optional[EstadoMulta] = None,
    ) -> GetAllMultasReq:
        return GetAllMultasReq.build(token, socio_id, estado)

    @staticmethod
    def to_get_all_response(multas: List[Multa]) -> GetAllMultasRes:
        return GetAllMultasRes.from_domain_list(multas)

    @staticmethod
    def to_get_by_id_request(token: Optional[str], id: int) -> GetMultaByIdReq:
        return GetMultaByIdReq.build(token, id)

    @staticmethod
    def to_create_request(token: Optional[str], payload: Dict[str, Any]) -> CreateMultaReq:
        return CreateMultaReq.build(token, payload)

    @staticmethod
    def to_action_request(
        token: Optional[str], id: int, payload: Optional[Dict[str, Any]] = None
    ) -> MultaActionReq:
        return MultaActionReq.build(token, id, payload)

    @staticmethod
    def to_response(multa: Multa) -> MultaRes:
        return MultaRes.from_domain(multa)
