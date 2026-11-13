from app.application.strategy.calculo_multa.core.calculo_multa_strategy import (
    CalculoMultaStrategy,
)


class ExtravioMultaStrategy(CalculoMultaStrategy):
    def __init__(self, monto_reposicion: float = 15000.0) -> None:
        self.monto_reposicion = monto_reposicion

    def calcular_monto(self, dias_atraso: int = 1) -> float:
        return self.monto_reposicion
