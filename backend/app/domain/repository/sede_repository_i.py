from abc import abstractmethod
from typing import List, Optional
from app.domain.entity.estado_sede import EstadoSede
from app.domain.entity.sede import Sede
from app.domain.repository.base_repository_i import BaseRepositoryI


class SedeRepositoryI(BaseRepositoryI[Sede]):
    @abstractmethod
    def get_all_filtered(self, estado: Optional[EstadoSede] = None) -> List[Sede]:
        pass

    @abstractmethod
    def get_by_nombre(self, nombre: str) -> Optional[Sede]:
        pass
