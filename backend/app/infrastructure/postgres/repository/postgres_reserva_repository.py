from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entity.estado_reserva import EstadoReserva
from app.infrastructure.postgres.model.reserva_model import ReservaModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresReservaRepository(BasePostgresRepository[ReservaModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, ReservaModel)

    def find_all_filtered(
        self,
        libro_id: Optional[int] = None,
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoReserva] = None,
    ) -> List[ReservaModel]:
        query = self.db.query(ReservaModel)
        if libro_id is not None:
            query = query.filter(ReservaModel.libro_id == libro_id)
        if socio_id is not None:
            query = query.filter(ReservaModel.socio_id == socio_id)
        if sede_id is not None:
            query = query.filter(ReservaModel.sede_id == sede_id)
        if estado is not None:
            query = query.filter(ReservaModel.estado == estado)
        return query.all()
