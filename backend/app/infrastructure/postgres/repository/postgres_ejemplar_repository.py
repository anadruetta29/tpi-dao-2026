from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.infrastructure.postgres.model.ejemplar_model import EjemplarModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresEjemplarRepository(BasePostgresRepository[EjemplarModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, EjemplarModel)

    def find_all_filtered(
        self,
        libro_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoEjemplar] = None,
    ) -> List[EjemplarModel]:
        query = self.db.query(EjemplarModel)
        if libro_id is not None:
            query = query.filter(EjemplarModel.libro_id == libro_id)
        if sede_id is not None:
            query = query.filter(EjemplarModel.sede_id == sede_id)
        if estado is not None:
            query = query.filter(EjemplarModel.estado == estado)
        return query.all()

    def find_by_codigo(self, codigo: str) -> Optional[EjemplarModel]:
        return self.db.query(EjemplarModel).filter(EjemplarModel.codigo == codigo).first()
