from typing import List
from pydantic import BaseModel
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.tarifa_multa import TarifaMulta


class TarifaMultaRes(BaseModel):
    motivo: MotivoMulta
    monto: float

    @staticmethod
    def from_domain(tarifa: TarifaMulta) -> "TarifaMultaRes":
        return TarifaMultaRes(
            motivo=tarifa.motivo,
            monto=tarifa.monto,
        )


class GetAllTarifasMultaRes(BaseModel):
    tarifas: List[TarifaMultaRes]

    @staticmethod
    def from_domain_list(tarifas: List[TarifaMulta]) -> "GetAllTarifasMultaRes":
        return GetAllTarifasMultaRes(
            tarifas=[TarifaMultaRes.from_domain(t) for t in tarifas]
        )
