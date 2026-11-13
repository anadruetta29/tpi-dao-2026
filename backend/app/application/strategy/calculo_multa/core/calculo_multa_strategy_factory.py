from typing import Dict
from app.application.strategy.calculo_multa.core.calculo_multa_strategy import (
    CalculoMultaStrategy,
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
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class CalculoMultaStrategyFactory:
    def __init__(self) -> None:
        self._strategies: Dict[MotivoMulta, CalculoMultaStrategy] = {
            MotivoMulta.ENTREGA_TARDIA: EntregaTardiaMultaStrategy(),
            MotivoMulta.EXTRAVIO: ExtravioMultaStrategy(),
            MotivoMulta.DESTRUCCION: DestruccionMultaStrategy(),
        }

    def get_strategy(self, motivo: MotivoMulta) -> CalculoMultaStrategy:
        strategy = self._strategies.get(motivo)
        if strategy is None:
            raise ErrorHandler(ErrorType.BAD_REQUEST, "Motivo de multa no soportado.")
        return strategy
