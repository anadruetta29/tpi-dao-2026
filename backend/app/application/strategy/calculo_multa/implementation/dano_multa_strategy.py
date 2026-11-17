from app.application.strategy.calculo_multa.core.calculo_multa_strategy import (
    CalculoMultaStrategy,
)


class DanoMultaStrategy(CalculoMultaStrategy):
    def __init__(self, monto_dano: float = 5000.0) -> None:
        self.monto_dano = monto_dano

    def calcular_monto(self, dias_atraso: int = 1) -> float:
        return self.monto_dano
