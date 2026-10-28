from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.datasources.base_datasource import BaseDatasource
from app.domain.entities.historial_estado_remito import HistorialEstadoRemito
from app.infrastructure.models.historial_estado_remito_model import HistorialEstadoRemitoModel


class HistorialEstadoRemitoPostgresDatasource(BaseDatasource[HistorialEstadoRemito]):
    def __init__(self, db: Session) -> None:
        self.db = db

    def _to_domain(self, model: HistorialEstadoRemitoModel) -> HistorialEstadoRemito:
        return HistorialEstadoRemito(
            fechaInicio=model.fechaInicio,
            fechaFin=model.fechaFin,
            estado=model.estado,
        )

    def getAll(self) -> List[HistorialEstadoRemito]:
        models = self.db.query(HistorialEstadoRemitoModel).all()
        return [self._to_domain(m) for m in models]

    def getById(self, id: int) -> Optional[HistorialEstadoRemito]:
        model = self.db.query(HistorialEstadoRemitoModel).filter(HistorialEstadoRemitoModel.id == id).first()
        return self._to_domain(model) if model else None

    def create(self, entity: HistorialEstadoRemito) -> HistorialEstadoRemito:
        model = HistorialEstadoRemitoModel(
            fechaInicio=entity.fechaInicio,
            fechaFin=entity.fechaFin,
            estado=entity.estado,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def update(self, id: int, entity: HistorialEstadoRemito) -> Optional[HistorialEstadoRemito]:
        model = self.db.query(HistorialEstadoRemitoModel).filter(HistorialEstadoRemitoModel.id == id).first()
        if not model:
            return None
        model.fechaInicio = entity.fechaInicio
        model.fechaFin = entity.fechaFin
        model.estado = entity.estado
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def delete(self, id: int) -> bool:
        model = self.db.query(HistorialEstadoRemitoModel).filter(HistorialEstadoRemitoModel.id == id).first()
        if not model:
            return False
        self.db.delete(model)
        self.db.commit()
        return True
