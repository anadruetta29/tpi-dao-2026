from typing import List, Optional
from app.domain.entity.estado_sede import EstadoSede
from app.domain.entity.sede import Sede
from app.domain.repository.sede_repository_i import SedeRepositoryI
from app.infrastructure.postgres.mapper.sede_entity_mapper import SedeEntityMapper
from app.infrastructure.postgres.model.sede_model import SedeModel
from app.infrastructure.postgres.repository.postgres_sede_repository import PostgresSedeRepository
from app.infrastructure.repository_adapter.base_repository_adapter import BaseRepositoryAdapter


class SedeRepositoryAdapter(BaseRepositoryAdapter[Sede, SedeModel], SedeRepositoryI):
    def __init__(self, repository: PostgresSedeRepository) -> None:
        super().__init__(repository, SedeEntityMapper)

    def get_all_filtered(self, estado: Optional[EstadoSede] = None) -> List[Sede]:
        return SedeEntityMapper.to_domain_list(self.repository.find_all_filtered(estado=estado))

    def get_by_nombre(self, nombre: str) -> Optional[Sede]:
        model = self.repository.find_by_nombre(nombre)
        return SedeEntityMapper.to_domain(model) if model is not None else None
