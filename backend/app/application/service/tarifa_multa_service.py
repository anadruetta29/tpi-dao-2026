from typing import Optional
from app.application.service.tarifa_multa_service_i import TarifaMultaServiceI
from app.application.use_case.configuracion.get_all_tarifas_multa_use_case import (
    GetAllTarifasMultaUseCase,
)
from app.application.use_case.configuracion.update_tarifa_multa_use_case import (
    UpdateTarifaMultaUseCase,
)
from app.presentation.dto.configuracion.mapper.tarifa_multa_mapper import TarifaMultaMapper
from app.presentation.dto.configuracion.request.update_tarifa_multa_req import UpdateTarifaMultaReq
from app.presentation.dto.configuracion.response.tarifa_multa_res import (
    GetAllTarifasMultaRes,
    TarifaMultaRes,
)


class TarifaMultaService(TarifaMultaServiceI):
    def __init__(
        self,
        get_all_use_case: GetAllTarifasMultaUseCase,
        update_use_case: UpdateTarifaMultaUseCase,
    ) -> None:
        self.get_all_use_case = get_all_use_case
        self.update_use_case = update_use_case

    def get_all(self, token: Optional[str]) -> GetAllTarifasMultaRes:
        result = self.get_all_use_case.execute(GetAllTarifasMultaUseCase.Command(token=token))
        return TarifaMultaMapper.to_get_all_response(result.tarifas)

    def update(self, dto: UpdateTarifaMultaReq) -> TarifaMultaRes:
        result = self.update_use_case.execute(
            UpdateTarifaMultaUseCase.Command(
                token=dto.get_token(),
                motivo=dto.get_motivo(),
                monto=dto.get_monto(),
            )
        )
        return TarifaMultaMapper.to_response(result.tarifa)
