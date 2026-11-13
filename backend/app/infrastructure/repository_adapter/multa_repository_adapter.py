from typing import List, Optional
from app.domain.entity.estado_multa import EstadoMulta
from app.domain.entity.multa import Multa
from app.domain.repository.multa_repository_i import MultaRepositoryI
from app.infrastructure.postgres.mapper.multa_entity_mapper import MultaEntityMapper
from app.infrastructure.postgres.model.multa_model import MultaModel
from app.infrastructure.postgres.repository.postgres_multa_repository import PostgresMultaRepository
from app.infrastructure.repository_adapter.base_repository_adapter import BaseRepositoryAdapter


class MultaRepositoryAdapter(BaseRepositoryAdapter[Multa, MultaModel], MultaRepositoryI):
    def __init__(self, repository: PostgresMultaRepository) -> None:
        super().__init__(repository, MultaEntityMapper)

    def get_all_filtered(
        self,
        socio_id: Optional[int] = None,
        estado: Optional[EstadoMulta] = None,
    ) -> List[Multa]:
        return MultaEntityMapper.to_domain_list(
            self.repository.find_all_filtered(socio_id=socio_id, estado=estado)
        )

    def has_pending_by_socio(self, socio_id: int) -> bool:
        return self.repository.has_pending_by_socio(socio_id)
