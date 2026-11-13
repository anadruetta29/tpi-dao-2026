from typing import List, Optional
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.infrastructure.postgres.mapper.ejemplar_entity_mapper import EjemplarEntityMapper
from app.infrastructure.postgres.model.ejemplar_model import EjemplarModel
from app.infrastructure.postgres.repository.postgres_ejemplar_repository import PostgresEjemplarRepository
from app.infrastructure.repository_adapter.base_repository_adapter import BaseRepositoryAdapter


class EjemplarRepositoryAdapter(BaseRepositoryAdapter[Ejemplar, EjemplarModel], EjemplarRepositoryI):
    def __init__(self, repository: PostgresEjemplarRepository) -> None:
        super().__init__(repository, EjemplarEntityMapper)

    def get_all_filtered(
        self,
        libro_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoEjemplar] = None,
    ) -> List[Ejemplar]:
        return EjemplarEntityMapper.to_domain_list(
            self.repository.find_all_filtered(libro_id=libro_id, sede_id=sede_id, estado=estado)
        )

    def get_by_codigo(self, codigo: str) -> Optional[Ejemplar]:
        model = self.repository.find_by_codigo(codigo)
        return EjemplarEntityMapper.to_domain(model) if model is not None else None
