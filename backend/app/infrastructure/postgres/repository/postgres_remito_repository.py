from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entity.estado_envio import EstadoEnvio
from app.infrastructure.postgres.model.historial_estado_remito_model import HistorialEstadoRemitoModel
from app.infrastructure.postgres.model.remito_model import RemitoModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresRemitoRepository(BasePostgresRepository[RemitoModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, RemitoModel)

    def find_all_filtered(
        self,
        sede_origen_id: Optional[int] = None,
        sede_destino_id: Optional[int] = None,
        estado: Optional[EstadoEnvio] = None,
    ) -> List[RemitoModel]:
        query = self.db.query(RemitoModel)
        if sede_origen_id is not None:
            query = query.filter(RemitoModel.sede_origen_id == sede_origen_id)
        if sede_destino_id is not None:
            query = query.filter(RemitoModel.sede_destino_id == sede_destino_id)
        if estado is not None:
            query = query.join(
                HistorialEstadoRemitoModel,
                HistorialEstadoRemitoModel.remito_id == RemitoModel.id,
            ).filter(
                HistorialEstadoRemitoModel.estado == estado,
                HistorialEstadoRemitoModel.fechaFin.is_(None),
            )
        return query.distinct().all()
