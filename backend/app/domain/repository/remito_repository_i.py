from abc import abstractmethod
from typing import List, Optional
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.remito import Remito
from app.domain.repository.base_repository_i import BaseRepositoryI


class RemitoRepositoryI(BaseRepositoryI[Remito]):
    @abstractmethod
    def get_all_filtered(
        self,
        sede_origen_id: Optional[int] = None,
        sede_destino_id: Optional[int] = None,
        estado: Optional[EstadoEnvio] = None,
    ) -> List[Remito]:
        pass
