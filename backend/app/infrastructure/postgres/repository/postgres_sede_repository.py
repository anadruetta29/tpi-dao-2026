from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entity.estado_sede import EstadoSede
from app.infrastructure.postgres.model.sede_model import SedeModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresSedeRepository(BasePostgresRepository[SedeModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, SedeModel)

    def find_all_filtered(self, estado: Optional[EstadoSede] = None) -> List[SedeModel]:
        query = self.db.query(SedeModel)
        if estado is not None:
            query = query.filter(SedeModel.estado == estado)
        return query.all()

    def find_by_nombre(self, nombre: str) -> Optional[SedeModel]:
        return self.db.query(SedeModel).filter(SedeModel.nombre == nombre).first()
