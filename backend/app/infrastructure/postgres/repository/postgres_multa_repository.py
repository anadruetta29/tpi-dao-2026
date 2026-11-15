from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entity.estado_multa import EstadoMulta
from app.domain.entity.motivo_multa import MotivoMulta
from app.infrastructure.postgres.model.multa_model import MultaModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresMultaRepository(BasePostgresRepository[MultaModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, MultaModel)

    def find_all_by_prestamo_and_motivo_for_update(
        self, prestamo_id: int, motivo: MotivoMulta
    ) -> List[MultaModel]:
        return (
            self.db.query(MultaModel)
            .filter(MultaModel.prestamo_id == prestamo_id, MultaModel.motivo == motivo)
            .order_by(MultaModel.id)
            .with_for_update(of=MultaModel)
            .all()
        )

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
