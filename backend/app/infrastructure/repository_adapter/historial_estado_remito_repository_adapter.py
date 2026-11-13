from typing import List, Optional
from app.domain.entity.historial_estado_remito import HistorialEstadoRemito
from app.domain.repository.historial_estado_remito_repository_i import HistorialEstadoRemitoRepositoryI
from app.infrastructure.postgres.mapper.historial_estado_remito_entity_mapper import (
    HistorialEstadoRemitoEntityMapper,
)
from app.infrastructure.postgres.model.historial_estado_remito_model import HistorialEstadoRemitoModel
from app.infrastructure.postgres.repository.postgres_historial_estado_remito_repository import (
    PostgresHistorialEstadoRemitoRepository,
)
from app.infrastructure.repository_adapter.base_repository_adapter import BaseRepositoryAdapter


class HistorialEstadoRemitoRepositoryAdapter(
    BaseRepositoryAdapter[HistorialEstadoRemito, HistorialEstadoRemitoModel],
    HistorialEstadoRemitoRepositoryI,
):
    def __init__(self, repository: PostgresHistorialEstadoRemitoRepository) -> None:
        super().__init__(repository, HistorialEstadoRemitoEntityMapper)

    def get_by_remito_id(self, remito_id: int) -> List[HistorialEstadoRemito]:
        return HistorialEstadoRemitoEntityMapper.to_domain_list(
            self.repository.find_by_remito_id(remito_id)
        )

    def get_latest_by_remito_id(self, remito_id: int) -> Optional[HistorialEstadoRemito]:
        model = self.repository.find_latest_by_remito_id(remito_id)
        return HistorialEstadoRemitoEntityMapper.to_domain(model) if model is not None else None
