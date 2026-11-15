from abc import abstractmethod
from typing import List, Optional
from app.domain.entity.estado_multa import EstadoMulta
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.multa import Multa
from app.domain.repository.base_repository_i import BaseRepositoryI


class MultaRepositoryI(BaseRepositoryI[Multa]):
    @abstractmethod
    def get_all_by_prestamo_and_motivo_for_update(
        self, prestamo_id: int, motivo: MotivoMulta
    ) -> List[Multa]:
        pass

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
