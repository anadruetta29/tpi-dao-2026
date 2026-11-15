from datetime import date
from typing import List, Optional
from app.domain.entity.devolucion import Devolucion
from app.domain.repository.devolucion_repository_i import DevolucionRepositoryI
from app.infrastructure.postgres.mapper.devolucion_entity_mapper import DevolucionEntityMapper
from app.infrastructure.postgres.model.devolucion_model import DevolucionModel
from app.infrastructure.postgres.repository import PostgresDevolucionRepository
from app.infrastructure.repository_adapter.base_repository_adapter import BaseRepositoryAdapter


class DevolucionRepositoryAdapter(
    BaseRepositoryAdapter[Devolucion, DevolucionModel],
    DevolucionRepositoryI,
):
    def __init__(self, repository: PostgresDevolucionRepository) -> None:
        super().__init__(repository, DevolucionEntityMapper)

    def get_ultima_fecha(self, prestamo_id: int) -> Optional[date]:
        return self.repository.find_ultima_fecha(prestamo_id)

    def get_all_by_sede(self, sede_id: int) -> List[Devolucion]:
        return self.mapper.to_domain_list(self.repository.find_all_by_sede(sede_id))

    def get_by_id_and_sede(self, id: int, sede_id: int) -> Optional[Devolucion]:
        model = self.repository.find_by_id_and_sede(id, sede_id)
        return self.mapper.to_domain(model) if model is not None else None
