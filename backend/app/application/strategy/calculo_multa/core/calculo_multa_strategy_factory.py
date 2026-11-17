from typing import Dict, Optional
from app.application.strategy.calculo_multa.core.calculo_multa_strategy import (
    CalculoMultaStrategy,
)
from app.application.strategy.calculo_multa.implementation.dano_multa_strategy import (
    DanoMultaStrategy,
)
from app.application.strategy.calculo_multa.implementation.destruccion_multa_strategy import (
    DestruccionMultaStrategy,
)
from app.application.strategy.calculo_multa.implementation.entrega_tardia_multa_strategy import (
    EntregaTardiaMultaStrategy,
)
from app.application.strategy.calculo_multa.implementation.extravio_multa_strategy import (
    ExtravioMultaStrategy,
)
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.tarifa_multa import TARIFAS_MULTA_DEFAULT
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.tarifa_multa_repository_i import TarifaMultaRepositoryI


class CalculoMultaStrategyFactory:
    def __init__(self, tarifa_multa_repository: Optional[TarifaMultaRepositoryI] = None) -> None:
        self.tarifa_multa_repository = tarifa_multa_repository
        self._strategies: Dict[MotivoMulta, type[CalculoMultaStrategy]] = {
            MotivoMulta.ENTREGA_TARDIA: EntregaTardiaMultaStrategy,
            MotivoMulta.DANO: DanoMultaStrategy,
            MotivoMulta.EXTRAVIO: ExtravioMultaStrategy,
            MotivoMulta.DESTRUCCION: DestruccionMultaStrategy,
        }

    def get_strategy(self, motivo: MotivoMulta) -> CalculoMultaStrategy:
        strategy_cls = self._strategies.get(motivo)
        if strategy_cls is None:
            raise ErrorHandler(ErrorType.BAD_REQUEST, "Motivo de multa no soportado.")
        tarifa = self.tarifa_multa_repository.get_by_motivo(motivo) if self.tarifa_multa_repository is not None else None
        monto = tarifa.monto if tarifa is not None else TARIFAS_MULTA_DEFAULT[motivo]
        return strategy_cls(monto)
