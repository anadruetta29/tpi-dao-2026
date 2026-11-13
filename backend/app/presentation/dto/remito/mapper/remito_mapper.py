from typing import Any, Dict, List, Optional
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.historial_estado_remito import HistorialEstadoRemito
from app.domain.entity.remito import Remito
from app.presentation.dto.remito.request import (
    CreateRemitoReq,
    DespachoRemitoReq,
    GetAllRemitosReq,
    GetRemitoByIdReq,
    RecepcionRemitoReq,
)
from app.presentation.dto.remito.response import (
    GetAllRemitosRes,
    GetRemitoTrazabilidadRes,
    RemitoRes,
)


class RemitoMapper:
    @staticmethod
    def to_get_all_request(
        token: Optional[str],
        sede_origen_id: Optional[int] = None,
        sede_destino_id: Optional[int] = None,
        estado: Optional[EstadoEnvio] = None,
    ) -> GetAllRemitosReq:
        return GetAllRemitosReq.build(token, sede_origen_id, sede_destino_id, estado)

    @staticmethod
    def to_get_all_response(remitos: List[Remito]) -> GetAllRemitosRes:
        return GetAllRemitosRes.from_domain_list(remitos)

    @staticmethod
    def to_get_by_id_request(token: Optional[str], id: int) -> GetRemitoByIdReq:
        return GetRemitoByIdReq.build(token, id)

    @staticmethod
    def to_create_request(token: Optional[str], payload: Dict[str, Any]) -> CreateRemitoReq:
        return CreateRemitoReq.build(token, payload)

    @staticmethod
    def to_despacho_request(
        token: Optional[str], id: int, payload: Optional[Dict[str, Any]] = None
    ) -> DespachoRemitoReq:
        return DespachoRemitoReq.build(token, id, payload)

    @staticmethod
    def to_recepcion_request(
        token: Optional[str], id: int, payload: Optional[Dict[str, Any]] = None
    ) -> RecepcionRemitoReq:
        return RecepcionRemitoReq.build(token, id, payload)

    @staticmethod
    def to_response(remito: Remito) -> RemitoRes:
        return RemitoRes.from_domain(remito)

    @staticmethod
    def to_trazabilidad_response(
        remito_id: int, historial: List[HistorialEstadoRemito]
    ) -> GetRemitoTrazabilidadRes:
        return GetRemitoTrazabilidadRes.from_domain_list(remito_id, historial)
