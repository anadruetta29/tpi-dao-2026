from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.datasources.base_datasource import BaseDatasource
from app.domain.entities.ejemplar import Ejemplar
from app.infrastructure.models.ejemplar_model import EjemplarModel


class EjemplarPostgresDatasource(BaseDatasource[Ejemplar]):
    def __init__(self, db: Session) -> None:
        self.db = db

    def _to_domain(self, model: EjemplarModel) -> Ejemplar:
        return Ejemplar(
            codigo=model.codigo,
            estado=model.estado,
        )

    def getAll(self) -> List[Ejemplar]:
        models = self.db.query(EjemplarModel).all()
        return [self._to_domain(m) for m in models]

    def getById(self, id: int) -> Optional[Ejemplar]:
        model = self.db.query(EjemplarModel).filter(EjemplarModel.id == id).first()
        return self._to_domain(model) if model else None

    def create(self, entity: Ejemplar) -> Ejemplar:
        model = EjemplarModel(
            codigo=entity.codigo,
            estado=entity.estado,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def update(self, id: int, entity: Ejemplar) -> Optional[Ejemplar]:
        model = self.db.query(EjemplarModel).filter(EjemplarModel.id == id).first()
        if not model:
            return None
        model.codigo = entity.codigo
        model.estado = entity.estado
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def delete(self, id: int) -> bool:
        model = self.db.query(EjemplarModel).filter(EjemplarModel.id == id).first()
        if not model:
            return False
        self.db.delete(model)
        self.db.commit()
        return True
