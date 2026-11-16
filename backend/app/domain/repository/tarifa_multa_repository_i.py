from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.tarifa_multa import TarifaMulta


class TarifaMultaRepositoryI(ABC):
    @abstractmethod
    def get_all(self) -> List[TarifaMulta]:
        pass

    @abstractmethod
    def get_by_motivo(self, motivo: MotivoMulta) -> Optional[TarifaMulta]:
        pass

    @abstractmethod
    def save_or_update(self, tarifa: TarifaMulta) -> TarifaMulta:
        pass
