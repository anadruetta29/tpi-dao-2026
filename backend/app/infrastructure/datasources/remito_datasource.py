from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.datasources.base_datasource import BaseDatasource
from app.domain.entities.remito import Remito
from app.infrastructure.models.remito_model import RemitoModel


class RemitoPostgresDatasource(BaseDatasource[Remito]):
    def __init__(self, db: Session) -> None:
        self.db = db

    def _to_domain(self, model: RemitoModel) -> Remito:
        return Remito(
            numero=model.numero,
            fechaEmision=model.fechaEmision,
            fechaDespacho=model.fechaDespacho,
            fechaRecepcion=model.fechaRecepcion,
        )

    def getAll(self) -> List[Remito]:
        models = self.db.query(RemitoModel).all()
        return [self._to_domain(m) for m in models]

    def getById(self, id: int) -> Optional[Remito]:
        model = self.db.query(RemitoModel).filter(RemitoModel.id == id).first()
        return self._to_domain(model) if model else None

    def create(self, entity: Remito) -> Remito:
        model = RemitoModel(
            numero=entity.numero,
            fechaEmision=entity.fechaEmision,
            fechaDespacho=entity.fechaDespacho,
            fechaRecepcion=entity.fechaRecepcion,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def update(self, id: int, entity: Remito) -> Optional[Remito]:
        model = self.db.query(RemitoModel).filter(RemitoModel.id == id).first()
        if not model:
            return None
        model.numero = entity.numero
        model.fechaEmision = entity.fechaEmision
        model.fechaDespacho = entity.fechaDespacho
        model.fechaRecepcion = entity.fechaRecepcion
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def delete(self, id: int) -> bool:
        model = self.db.query(RemitoModel).filter(RemitoModel.id == id).first()
        if not model:
            return False
        self.db.delete(model)
        self.db.commit()
        return True
