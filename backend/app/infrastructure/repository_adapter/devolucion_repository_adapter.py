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
