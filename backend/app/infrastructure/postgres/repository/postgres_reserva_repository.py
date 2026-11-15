from datetime import date
from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.domain.entity.estado_reserva import EstadoReserva
from app.infrastructure.postgres.model.reserva_model import ReservaModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresReservaRepository(BasePostgresRepository[ReservaModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, ReservaModel)

    def find_pendientes_for_update(self, libro_id: int, sede_id: Optional[int], ejemplar_id: int) -> List[ReservaModel]:
        return (
            self.db.query(ReservaModel)
            .filter(
                ReservaModel.libro_id == libro_id,
                ReservaModel.estado == EstadoReserva.ACTIVA,
                or_(ReservaModel.sede_id.is_(None), ReservaModel.sede_id == sede_id),
                or_(ReservaModel.ejemplar_id.is_(None), ReservaModel.ejemplar_id == ejemplar_id),
            )
            .order_by(ReservaModel.fecha.asc().nullslast(), ReservaModel.id.asc())
            .with_for_update()
            .all()
        )

    def find_ids_por_vencer_retiro(self, hoy: date) -> List[int]:
        rows = self.db.query(ReservaModel.id).filter(
            ReservaModel.estado == EstadoReserva.LISTA_PARA_RETIRO,
            ReservaModel.fecha_limite_retiro < hoy,
        ).all()
        return [id for (id,) in rows]

    def find_all_filtered(
        self,
        libro_id: Optional[int] = None,
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoReserva] = None,
        ejemplar_id: Optional[int] = None,
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
        if ejemplar_id is not None:
            query = query.filter(ReservaModel.ejemplar_id == ejemplar_id)
        return query.all()
