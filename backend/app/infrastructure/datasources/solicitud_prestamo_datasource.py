from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.datasources.base_datasource import BaseDatasource
from app.domain.entities.solicitud_prestamo import SolicitudPrestamo
from app.infrastructure.models.solicitud_prestamo_model import SolicitudPrestamoModel


class SolicitudPrestamoPostgresDatasource(BaseDatasource[SolicitudPrestamo]):
    def __init__(self, db: Session) -> None:
        self.db = db

    def _to_domain(self, model: SolicitudPrestamoModel) -> SolicitudPrestamo:
        return SolicitudPrestamo(
            numero=model.numero,
            tipo=model.tipo,
            estado=model.estado,
        )

    def getAll(self) -> List[SolicitudPrestamo]:
        models = self.db.query(SolicitudPrestamoModel).all()
        return [self._to_domain(m) for m in models]

    def getById(self, id: int) -> Optional[SolicitudPrestamo]:
        model = self.db.query(SolicitudPrestamoModel).filter(SolicitudPrestamoModel.id == id).first()
        return self._to_domain(model) if model else None

    def create(self, entity: SolicitudPrestamo) -> SolicitudPrestamo:
        model = SolicitudPrestamoModel(
            numero=entity.numero,
            tipo=entity.tipo,
            estado=entity.estado,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def update(self, id: int, entity: SolicitudPrestamo) -> Optional[SolicitudPrestamo]:
        model = self.db.query(SolicitudPrestamoModel).filter(SolicitudPrestamoModel.id == id).first()
        if not model:
            return None
        model.numero = entity.numero
        model.tipo = entity.tipo
        model.estado = entity.estado
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def delete(self, id: int) -> bool:
        model = self.db.query(SolicitudPrestamoModel).filter(SolicitudPrestamoModel.id == id).first()
        if not model:
            return False
        self.db.delete(model)
        self.db.commit()
        return True
