from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.infrastructure.postgres.model.prestamo_model import PrestamoModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresPrestamoRepository(BasePostgresRepository[PrestamoModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, PrestamoModel)

    def find_all_filtered(
        self,
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoPrestamo] = None,
    ) -> List[PrestamoModel]:
        query = self.db.query(PrestamoModel)
        if socio_id is not None:
            query = query.filter(PrestamoModel.socio_id == socio_id)
        if sede_id is not None:
            query = query.filter(PrestamoModel.sede_id == sede_id)
        if estado is not None:
            query = query.filter(PrestamoModel.estado == estado)
        return query.all()
