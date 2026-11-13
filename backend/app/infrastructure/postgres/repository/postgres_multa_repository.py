from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entity.estado_multa import EstadoMulta
from app.infrastructure.postgres.model.multa_model import MultaModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresMultaRepository(BasePostgresRepository[MultaModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, MultaModel)

    def find_all_filtered(
        self,
        socio_id: Optional[int] = None,
        estado: Optional[EstadoMulta] = None,
    ) -> List[MultaModel]:
        query = self.db.query(MultaModel)
        if socio_id is not None:
            query = query.filter(MultaModel.socio_id == socio_id)
        if estado is not None:
            query = query.filter(MultaModel.estado == estado)
        return query.all()

    def has_pending_by_socio(self, socio_id: int) -> bool:
        return (
            self.db.query(MultaModel)
            .filter(
                MultaModel.socio_id == socio_id,
                MultaModel.estado == EstadoMulta.PENDIENTE,
            )
            .first()
            is not None
        )
