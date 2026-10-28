from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.datasources.base_datasource import BaseDatasource
from app.domain.entities.devolucion import Devolucion
from app.infrastructure.models.devolucion_model import DevolucionModel


class DevolucionPostgresDatasource(BaseDatasource[Devolucion]):
    def __init__(self, db: Session) -> None:
        self.db = db

    def _to_domain(self, model: DevolucionModel) -> Devolucion:
        return Devolucion(
            fecha=model.fecha,
            observaciones=model.observaciones,
            estadoDevuelto=model.estadoDevuelto,
        )

    def getAll(self) -> List[Devolucion]:
        models = self.db.query(DevolucionModel).all()
        return [self._to_domain(m) for m in models]

    def getById(self, id: int) -> Optional[Devolucion]:
        model = self.db.query(DevolucionModel).filter(DevolucionModel.id == id).first()
        return self._to_domain(model) if model else None

    def create(self, entity: Devolucion) -> Devolucion:
        model = DevolucionModel(
            fecha=entity.fecha,
            observaciones=entity.observaciones,
            estadoDevuelto=entity.estadoDevuelto,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def update(self, id: int, entity: Devolucion) -> Optional[Devolucion]:
        model = self.db.query(DevolucionModel).filter(DevolucionModel.id == id).first()
        if not model:
            return None
        model.fecha = entity.fecha
        model.observaciones = entity.observaciones
        model.estadoDevuelto = entity.estadoDevuelto
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def delete(self, id: int) -> bool:
        model = self.db.query(DevolucionModel).filter(DevolucionModel.id == id).first()
        if not model:
            return False
        self.db.delete(model)
        self.db.commit()
        return True
