from typing import List, Optional
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.remito import Remito
from app.domain.repository.remito_repository_i import RemitoRepositoryI
from app.infrastructure.postgres.mapper.remito_entity_mapper import RemitoEntityMapper
from app.infrastructure.postgres.model.ejemplar_model import EjemplarModel
from app.infrastructure.postgres.model.remito_model import RemitoIncidenciaModel, RemitoModel
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

    def update(self, id: int, entity: Remito) -> Optional[Remito]:
        existing = self.repository.find_by_id(id)
        if existing is None:
            return None
        existing.numero = entity.numero
        existing.fechaEmision = entity.fechaEmision
        existing.fechaDespacho = entity.fechaDespacho
        existing.fechaRecepcion = entity.fechaRecepcion
        existing.sede_origen_id = entity.sede_origen_id
        existing.sede_destino_id = entity.sede_destino_id
        existing.solicitud_id = entity.solicitud_id
        if entity.incidencias:
            existing.incidencias = [
                RemitoIncidenciaModel(
                    remito_id=id,
                    ejemplar_id=inc.ejemplar_id,
                    estado=inc.estado,
                    observacion=inc.observacion,
                )
                for inc in entity.incidencias
                if inc.ejemplar_id is not None and inc.estado is not None
            ]
        updated = self.repository.update(id, existing)
        return RemitoEntityMapper.to_domain(updated) if updated is not None else None
