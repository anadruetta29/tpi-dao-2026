from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.datasources.base_datasource import BaseDatasource
from app.domain.entities.autor import Autor
from app.infrastructure.models.autor_model import AutorModel


class AutorPostgresDatasource(BaseDatasource[Autor]):
    def __init__(self, db: Session) -> None:
        self.db = db

    def _to_domain(self, model: AutorModel) -> Autor:
        return Autor(
            nombre=model.nombre,
            apellido=model.apellido,
        )

    def getAll(self) -> List[Autor]:
        models = self.db.query(AutorModel).all()
        return [self._to_domain(m) for m in models]

    def getById(self, id: int) -> Optional[Autor]:
        model = self.db.query(AutorModel).filter(AutorModel.id == id).first()
        return self._to_domain(model) if model else None

    def create(self, entity: Autor) -> Autor:
        model = AutorModel(
            nombre=entity.nombre,
            apellido=entity.apellido,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def update(self, id: int, entity: Autor) -> Optional[Autor]:
        model = self.db.query(AutorModel).filter(AutorModel.id == id).first()
        if not model:
            return None
        model.nombre = entity.nombre
        model.apellido = entity.apellido
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def delete(self, id: int) -> bool:
        model = self.db.query(AutorModel).filter(AutorModel.id == id).first()
        if not model:
            return False
        self.db.delete(model)
        self.db.commit()
        return True
