from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.infrastructure.postgres.model.solicitud_prestamo_model import SolicitudPrestamoModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresSolicitudPrestamoRepository(BasePostgresRepository[SolicitudPrestamoModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, SolicitudPrestamoModel)

    def find_all_filtered(
        self,
        tipo: Optional[TipoPrestamo] = None,
        estado: Optional[EstadoSolicitud] = None,
        sede_id: Optional[int] = None,
    ) -> List[SolicitudPrestamoModel]:
        query = self.db.query(SolicitudPrestamoModel)
        if tipo is not None:
            query = query.filter(SolicitudPrestamoModel.tipo == tipo)
        if estado is not None:
            query = query.filter(SolicitudPrestamoModel.estado == estado)
        if sede_id is not None:
            query = query.filter(
                or_(
                    SolicitudPrestamoModel.sede_origen_id == sede_id,
                    SolicitudPrestamoModel.sede_destino_id == sede_id,
                )
            )
        return query.all()
