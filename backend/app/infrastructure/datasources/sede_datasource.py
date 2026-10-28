from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.datasources.base_datasource import BaseDatasource
from app.domain.entities.sede import Sede
from app.infrastructure.models.sede_model import SedeModel


class SedePostgresDatasource(BaseDatasource[Sede]):
    def __init__(self, db: Session) -> None:
        self.db = db

    def _to_domain(self, model: SedeModel) -> Sede:
        return Sede(
            nombre=model.nombre,
            telefono=model.telefono,
            email=model.email,
            horarioAtencion=model.horarioAtencion,
            estado=model.estado,
        )

    def getAll(self) -> List[Sede]:
        models = self.db.query(SedeModel).all()
        return [self._to_domain(m) for m in models]

    def getById(self, id: int) -> Optional[Sede]:
        model = self.db.query(SedeModel).filter(SedeModel.id == id).first()
        return self._to_domain(model) if model else None

    def create(self, entity: Sede) -> Sede:
        model = SedeModel(
            nombre=entity.nombre,
            telefono=entity.telefono,
            email=entity.email,
            horarioAtencion=entity.horarioAtencion,
            estado=entity.estado,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def update(self, id: int, entity: Sede) -> Optional[Sede]:
        model = self.db.query(SedeModel).filter(SedeModel.id == id).first()
        if not model:
            return None
        model.nombre = entity.nombre
        model.telefono = entity.telefono
        model.email = entity.email
        model.horarioAtencion = entity.horarioAtencion
        model.estado = entity.estado
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def delete(self, id: int) -> bool:
        model = self.db.query(SedeModel).filter(SedeModel.id == id).first()
        if not model:
            return False
        self.db.delete(model)
        self.db.commit()
        return True
