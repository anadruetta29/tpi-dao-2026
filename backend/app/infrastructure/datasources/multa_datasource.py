from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.datasources.base_datasource import BaseDatasource
from app.domain.entities.multa import Multa
from app.infrastructure.models.multa_model import MultaModel


class MultaPostgresDatasource(BaseDatasource[Multa]):
    def __init__(self, db: Session) -> None:
        self.db = db

    def _to_domain(self, model: MultaModel) -> Multa:
        return Multa(
            fechaEmision=model.fechaEmision,
            motivo=model.motivo,
            monto=model.monto,
            estado=model.estado,
            fechaPago=model.fechaPago,
        )

    def getAll(self) -> List[Multa]:
        models = self.db.query(MultaModel).all()
        return [self._to_domain(m) for m in models]

    def getById(self, id: int) -> Optional[Multa]:
        model = self.db.query(MultaModel).filter(MultaModel.id == id).first()
        return self._to_domain(model) if model else None

    def create(self, entity: Multa) -> Multa:
        model = MultaModel(
            fechaEmision=entity.fechaEmision,
            motivo=entity.motivo,
            monto=entity.monto,
            estado=entity.estado,
            fechaPago=entity.fechaPago,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def update(self, id: int, entity: Multa) -> Optional[Multa]:
        model = self.db.query(MultaModel).filter(MultaModel.id == id).first()
        if not model:
            return None
        model.fechaEmision = entity.fechaEmision
        model.motivo = entity.motivo
        model.monto = entity.monto
        model.estado = entity.estado
        model.fechaPago = entity.fechaPago
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def delete(self, id: int) -> bool:
        model = self.db.query(MultaModel).filter(MultaModel.id == id).first()
        if not model:
            return False
        self.db.delete(model)
        self.db.commit()
        return True
