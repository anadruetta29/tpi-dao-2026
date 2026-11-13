from typing import Any, Dict, List, Optional
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.presentation.dto.ejemplar.request import (
    CreateEjemplarReq,
    GetAllEjemplaresReq,
    GetEjemplarByIdReq,
)
from app.presentation.dto.ejemplar.response import EjemplarRes, GetAllEjemplaresRes


class EjemplarMapper:
    @staticmethod
    def to_get_all_request(
        token: Optional[str],
        libro_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoEjemplar] = None,
    ) -> GetAllEjemplaresReq:
        return GetAllEjemplaresReq.build(token, libro_id, sede_id, estado)

    @staticmethod
    def to_get_all_response(ejemplares: List[Ejemplar]) -> GetAllEjemplaresRes:
        return GetAllEjemplaresRes.from_domain_list(ejemplares)

    @staticmethod
    def to_get_by_id_request(token: Optional[str], id: int) -> GetEjemplarByIdReq:
        return GetEjemplarByIdReq.build(token, id)

    @staticmethod
    def to_create_request(token: Optional[str], payload: Dict[str, Any]) -> CreateEjemplarReq:
        return CreateEjemplarReq.build(token, payload)

    @staticmethod
    def to_response(ejemplar: Ejemplar) -> EjemplarRes:
        return EjemplarRes.from_domain(ejemplar)
