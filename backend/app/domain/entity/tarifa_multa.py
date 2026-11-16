from dataclasses import dataclass
from typing import Dict
from app.domain.entity.motivo_multa import MotivoMulta

TARIFAS_MULTA_DEFAULT: Dict[MotivoMulta, float] = {
    MotivoMulta.ENTREGA_TARDIA: 1000.0,
    MotivoMulta.EXTRAVIO: 15000.0,
    MotivoMulta.DESTRUCCION: 20000.0,
}


@dataclass
class TarifaMulta:
    motivo: MotivoMulta
    monto: float

    @staticmethod
    def default_para(motivo: MotivoMulta) -> "TarifaMulta":
        return TarifaMulta(motivo=motivo, monto=TARIFAS_MULTA_DEFAULT[motivo])
