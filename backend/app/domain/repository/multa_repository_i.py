from abc import abstractmethod
from typing import List, Optional
from app.domain.entity.estado_multa import EstadoMulta
from app.domain.entity.multa import Multa
from app.domain.repository.base_repository_i import BaseRepositoryI


class MultaRepositoryI(BaseRepositoryI[Multa]):
    @abstractmethod
    def get_all_filtered(
        self,
        socio_id: Optional[int] = None,
        estado: Optional[EstadoMulta] = None,
    ) -> List[Multa]:
        pass

    @abstractmethod
    def has_pending_by_socio(self, socio_id: int) -> bool:
        pass
