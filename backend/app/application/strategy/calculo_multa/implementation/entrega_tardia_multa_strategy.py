from app.application.strategy.calculo_multa.core.calculo_multa_strategy import (
    CalculoMultaStrategy,
)


class EntregaTardiaMultaStrategy(CalculoMultaStrategy):
    def __init__(self, tarifa_diaria: float = 500.0) -> None:
        self.tarifa_diaria = tarifa_diaria

    def calcular_monto(self, dias_atraso: int = 1) -> float:
        return float(max(1, dias_atraso)) * self.tarifa_diaria
