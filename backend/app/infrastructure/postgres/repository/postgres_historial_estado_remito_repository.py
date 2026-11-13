from typing import List, Optional
from sqlalchemy.orm import Session
from app.infrastructure.postgres.model.historial_estado_remito_model import HistorialEstadoRemitoModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresHistorialEstadoRemitoRepository(BasePostgresRepository[HistorialEstadoRemitoModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, HistorialEstadoRemitoModel)

    def find_by_remito_id(self, remito_id: int) -> List[HistorialEstadoRemitoModel]:
        return (
            self.db.query(HistorialEstadoRemitoModel)
            .filter(HistorialEstadoRemitoModel.remito_id == remito_id)
            .order_by(HistorialEstadoRemitoModel.id.asc())
            .all()
        )

    def find_latest_by_remito_id(self, remito_id: int) -> Optional[HistorialEstadoRemitoModel]:
        return (
            self.db.query(HistorialEstadoRemitoModel)
            .filter(HistorialEstadoRemitoModel.remito_id == remito_id)
            .order_by(HistorialEstadoRemitoModel.id.desc())
            .first()
        )
