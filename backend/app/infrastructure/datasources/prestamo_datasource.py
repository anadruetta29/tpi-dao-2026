from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.datasources.base_datasource import BaseDatasource
from app.domain.entities.prestamo import Prestamo
from app.infrastructure.models.prestamo_model import PrestamoModel


class PrestamoPostgresDatasource(BaseDatasource[Prestamo]):
    def __init__(self, db: Session) -> None:
        self.db = db

    def _to_domain(self, model: PrestamoModel) -> Prestamo:
        return Prestamo(
            fechaInicio=model.fechaInicio,
            fechaVencimiento=model.fechaVencimiento,
            fechaDevolucion=model.fechaDevolucion,
            estado=model.estado,
            modalidad=model.modalidad,
        )

    def getAll(self) -> List[Prestamo]:
        models = self.db.query(PrestamoModel).all()
        return [self._to_domain(m) for m in models]

    def getById(self, id: int) -> Optional[Prestamo]:
        model = self.db.query(PrestamoModel).filter(PrestamoModel.id == id).first()
        return self._to_domain(model) if model else None

    def create(self, entity: Prestamo) -> Prestamo:
        model = PrestamoModel(
            fechaInicio=entity.fechaInicio,
            fechaVencimiento=entity.fechaVencimiento,
            fechaDevolucion=entity.fechaDevolucion,
            estado=entity.estado,
            modalidad=entity.modalidad,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def update(self, id: int, entity: Prestamo) -> Optional[Prestamo]:
        model = self.db.query(PrestamoModel).filter(PrestamoModel.id == id).first()
        if not model:
            return None
        model.fechaInicio = entity.fechaInicio
        model.fechaVencimiento = entity.fechaVencimiento
        model.fechaDevolucion = entity.fechaDevolucion
        model.estado = entity.estado
        model.modalidad = entity.modalidad
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def delete(self, id: int) -> bool:
        model = self.db.query(PrestamoModel).filter(PrestamoModel.id == id).first()
        if not model:
            return False
        self.db.delete(model)
        self.db.commit()
        return True
