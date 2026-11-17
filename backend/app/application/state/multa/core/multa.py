from abc import ABC, abstractmethod
from datetime import date
from app.domain.entity.multa import Multa


class MultaEstadoState(ABC):
    @abstractmethod
    def pagar(self, multa: Multa, fecha_pago: date) -> None:
        pass

    @abstractmethod
    def anular(self, multa: Multa) -> None:
        pass
