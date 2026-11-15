from typing import List, Optional
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.remito import Remito
from app.domain.repository.remito_repository_i import RemitoRepositoryI
from app.infrastructure.postgres.mapper.remito_entity_mapper import RemitoEntityMapper
from app.infrastructure.postgres.model.ejemplar_model import EjemplarModel
from app.infrastructure.postgres.model.remito_model import RemitoModel
from app.infrastructure.postgres.repository.postgres_remito_repository import PostgresRemitoRepository
from app.infrastructure.repository_adapter.base_repository_adapter import BaseRepositoryAdapter


class RemitoRepositoryAdapter(BaseRepositoryAdapter[Remito, RemitoModel], RemitoRepositoryI):
    def __init__(self, repository: PostgresRemitoRepository) -> None:
        super().__init__(repository, RemitoEntityMapper)

    def get_by_solicitud_id(self, solicitud_id: int) -> Optional[Remito]:
        model = self.repository.find_by_solicitud_id(solicitud_id)
        return self.mapper.to_domain(model) if model is not None else None

    def get_all_filtered(
        self,
        sede_origen_id: Optional[int] = None,
        sede_destino_id: Optional[int] = None,
        estado: Optional[EstadoEnvio] = None,
        sede_recepcionista_id: Optional[int] = None,
    ) -> List[Remito]:
        rows = self.repository.find_all_filtered(
            sede_origen_id=sede_origen_id,
            sede_destino_id=sede_destino_id,
            estado=estado,
            sede_recepcionista_id=sede_recepcionista_id,
        )
        return [RemitoEntityMapper.to_domain(model, EstadoEnvio(estado_actual)) for model, estado_actual in rows]

    def save(self, entity: Remito) -> Remito:
        model = RemitoEntityMapper.to_model(entity)
        if entity.ejemplar_ids:
            model.ejemplares = (
                self.repository.db.query(EjemplarModel)
                .filter(EjemplarModel.id.in_(entity.ejemplar_ids))
                .all()
            )
        saved = self.repository.save(model)
        return RemitoEntityMapper.to_domain(saved)
