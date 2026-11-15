from datetime import date
from typing import List, Optional
from sqlalchemy import or_, select
from sqlalchemy.orm import Session
from sqlalchemy.sql.elements import ColumnElement
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.infrastructure.postgres.model.prestamo_model import PrestamoModel
from app.infrastructure.postgres.model.solicitud_prestamo_model import SolicitudPrestamoModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresPrestamoRepository(BasePostgresRepository[PrestamoModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, PrestamoModel)

    def find_by_solicitud_id(self, solicitud_id: int) -> Optional[PrestamoModel]:
        return self.db.query(PrestamoModel).filter(PrestamoModel.solicitud_id == solicitud_id).first()

    def find_ids_vencidos(self, fecha: date) -> List[int]:
        rows = (
            self.db.query(PrestamoModel.id)
            .filter(
                PrestamoModel.fechaVencimiento < fecha,
                PrestamoModel.fechaDevolucion.is_(None),
                PrestamoModel.estado.in_((EstadoPrestamo.ACTIVO, EstadoPrestamo.VENCIDO)),
            )
            .all()
        )
        return [id for (id,) in rows]

    def find_by_id_for_update(self, id: int) -> Optional[PrestamoModel]:
        return self.db.query(PrestamoModel).filter(PrestamoModel.id == id).with_for_update().first()

    def find_by_id(self, id: int, sede_recepcionista_id: Optional[int] = None) -> Optional[PrestamoModel]:
        query = self.db.query(PrestamoModel).filter(PrestamoModel.id == id)
        if sede_recepcionista_id is not None:
            query = query.filter(self._pertenece_a_sede(sede_recepcionista_id))
        return query.first()

    def find_all_filtered(
        self,
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoPrestamo] = None,
        sede_recepcionista_id: Optional[int] = None,
    ) -> List[PrestamoModel]:
        query = self.db.query(PrestamoModel)
        if socio_id is not None:
            query = query.filter(PrestamoModel.socio_id == socio_id)
        if sede_id is not None:
            query = query.filter(PrestamoModel.sede_id == sede_id)
        if estado is not None:
            query = query.filter(PrestamoModel.estado == estado)
        if sede_recepcionista_id is not None:
            query = query.filter(self._pertenece_a_sede(sede_recepcionista_id))
        return query.all()

    @staticmethod
    def _pertenece_a_sede(sede_id: int) -> ColumnElement[bool]:
        solicitud_interbibliotecaria = select(SolicitudPrestamoModel.id).where(
            SolicitudPrestamoModel.id == PrestamoModel.solicitud_id,
            SolicitudPrestamoModel.tipo == TipoPrestamo.INTERBIBLIOTECARIO,
            or_(
                SolicitudPrestamoModel.sede_origen_id == sede_id,
                SolicitudPrestamoModel.sede_destino_id == sede_id,
            ),
        ).exists()
        return or_(PrestamoModel.sede_id == sede_id, solicitud_interbibliotecaria)
