from abc import abstractmethod
from datetime import date
from typing import List, Optional
from app.domain.entity.devolucion import Devolucion
from app.domain.repository.base_repository_i import BaseRepositoryI


class DevolucionRepositoryI(BaseRepositoryI[Devolucion]):
    @abstractmethod
    def get_ultima_fecha(self, prestamo_id: int) -> Optional[date]:
        pass

    @abstractmethod
    def get_all_by_sede(self, sede_id: int) -> List[Devolucion]:
        pass

    @abstractmethod
    def get_by_id_and_sede(self, id: int, sede_id: int) -> Optional[Devolucion]:
        pass
