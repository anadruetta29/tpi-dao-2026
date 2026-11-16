from abc import ABC, abstractmethod
from typing import Optional
from app.presentation.dto.configuracion.request.update_tarifa_multa_req import UpdateTarifaMultaReq
from app.presentation.dto.configuracion.response.tarifa_multa_res import (
    GetAllTarifasMultaRes,
    TarifaMultaRes,
)


class TarifaMultaServiceI(ABC):
    @abstractmethod
    def get_all(self, token: Optional[str]) -> GetAllTarifasMultaRes:
        pass

    @abstractmethod
    def update(self, dto: UpdateTarifaMultaReq) -> TarifaMultaRes:
        pass
