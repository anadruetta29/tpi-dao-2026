from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.datasources.base_datasource import BaseDatasource
from app.domain.entities.reserva import Reserva
from app.infrastructure.models.reserva_model import ReservaModel


class ReservaPostgresDatasource(BaseDatasource[Reserva]):
    def __init__(self, db: Session) -> None:
        self.db = db

    def _to_domain(self, model: ReservaModel) -> Reserva:
        return Reserva(
            fecha=model.fecha,
            estado=model.estado,
        )

    def getAll(self) -> List[Reserva]:
        models = self.db.query(ReservaModel).all()
        return [self._to_domain(m) for m in models]

    def getById(self, id: int) -> Optional[Reserva]:
        model = self.db.query(ReservaModel).filter(ReservaModel.id == id).first()
        return self._to_domain(model) if model else None

    def create(self, entity: Reserva) -> Reserva:
        model = ReservaModel(
            fecha=entity.fecha,
            estado=entity.estado,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def update(self, id: int, entity: Reserva) -> Optional[Reserva]:
        model = self.db.query(ReservaModel).filter(ReservaModel.id == id).first()
        if not model:
            return None
        model.fecha = entity.fecha
        model.estado = entity.estado
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def delete(self, id: int) -> bool:
        model = self.db.query(ReservaModel).filter(ReservaModel.id == id).first()
        if not model:
            return False
        self.db.delete(model)
        self.db.commit()
        return True
