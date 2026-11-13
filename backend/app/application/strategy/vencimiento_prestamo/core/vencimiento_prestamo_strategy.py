from abc import ABC, abstractmethod
from datetime import date


class VencimientoPrestamoStrategy(ABC):
    @abstractmethod
    def calcular_vencimiento(self, fecha_inicio: date) -> date:
        pass
