from typing import List, Optional, Tuple
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.domain.entity.estado_envio import EstadoEnvio
from app.infrastructure.postgres.model.historial_estado_remito_model import HistorialEstadoRemitoModel
from app.infrastructure.postgres.model.remito_model import RemitoModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresRemitoRepository(BasePostgresRepository[RemitoModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, RemitoModel)

    def find_by_solicitud_id(self, solicitud_id: int) -> Optional[RemitoModel]:
        return self.db.query(RemitoModel).filter(RemitoModel.solicitud_id == solicitud_id).first()

    def find_all_filtered(
        self,
        sede_origen_id: Optional[int] = None,
        sede_destino_id: Optional[int] = None,
        estado: Optional[EstadoEnvio] = None,
        sede_recepcionista_id: Optional[int] = None,
    ) -> List[Tuple[RemitoModel, EstadoEnvio]]:
        latest_estado = (
            self.db.query(HistorialEstadoRemitoModel.estado)
            .filter(HistorialEstadoRemitoModel.remito_id == RemitoModel.id)
            .order_by(HistorialEstadoRemitoModel.id.desc())
            .limit(1)
            .correlate(RemitoModel)
            .scalar_subquery()
        )
        estado_actual = func.coalesce(latest_estado, EstadoEnvio.PENDIENTE.value)
        query = self.db.query(RemitoModel, estado_actual)
        if sede_origen_id is not None:
            query = query.filter(RemitoModel.sede_origen_id == sede_origen_id)
        if sede_destino_id is not None:
            query = query.filter(RemitoModel.sede_destino_id == sede_destino_id)
        if sede_recepcionista_id is not None:
            query = query.filter(or_(
                RemitoModel.sede_origen_id == sede_recepcionista_id,
                RemitoModel.sede_destino_id == sede_recepcionista_id,
            ))
        if estado is not None:
            query = query.filter(estado_actual == estado)
        return query.distinct().all()
