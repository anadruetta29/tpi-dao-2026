from typing import Any, Dict, List, Optional
from app.domain.entity.tarifa_multa import TarifaMulta
from app.presentation.dto.configuracion.request.update_tarifa_multa_req import UpdateTarifaMultaReq
from app.presentation.dto.configuracion.response.tarifa_multa_res import (
    GetAllTarifasMultaRes,
    TarifaMultaRes,
)


class TarifaMultaMapper:
    @staticmethod
    def to_update_request(token: Optional[str], motivo: str, payload: Dict[str, Any]) -> UpdateTarifaMultaReq:
        return UpdateTarifaMultaReq.build(token, motivo, payload)

    @staticmethod
    def to_response(tarifa: TarifaMulta) -> TarifaMultaRes:
        return TarifaMultaRes.from_domain(tarifa)

    @staticmethod
    def to_get_all_response(tarifas: List[TarifaMulta]) -> GetAllTarifasMultaRes:
        return GetAllTarifasMultaRes.from_domain_list(tarifas)
