from abc import ABC, abstractmethod


class CalculoMultaStrategy(ABC):
    @abstractmethod
    def calcular_monto(self, dias_atraso: int = 1) -> float:
        pass
