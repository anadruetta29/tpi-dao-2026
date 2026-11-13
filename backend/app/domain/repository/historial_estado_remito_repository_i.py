from abc import abstractmethod
from typing import List, Optional
from app.domain.entity.historial_estado_remito import HistorialEstadoRemito
from app.domain.repository.base_repository_i import BaseRepositoryI


class HistorialEstadoRemitoRepositoryI(BaseRepositoryI[HistorialEstadoRemito]):
    @abstractmethod
    def get_by_remito_id(self, remito_id: int) -> List[HistorialEstadoRemito]:
        pass

    @abstractmethod
    def get_latest_by_remito_id(self, remito_id: int) -> Optional[HistorialEstadoRemito]:
        pass
