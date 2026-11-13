from abc import abstractmethod
from typing import List, Optional
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.repository.base_repository_i import BaseRepositoryI


class EjemplarRepositoryI(BaseRepositoryI[Ejemplar]):
    @abstractmethod
    def get_all_filtered(
        self,
        libro_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoEjemplar] = None,
    ) -> List[Ejemplar]:
        pass

    @abstractmethod
    def get_by_codigo(self, codigo: str) -> Optional[Ejemplar]:
        pass
