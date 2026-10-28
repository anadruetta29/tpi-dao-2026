from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.datasources.base_datasource import BaseDatasource
from app.domain.entities.libro import Libro
from app.infrastructure.models.libro_model import LibroModel


class LibroPostgresDatasource(BaseDatasource[Libro]):
    def __init__(self, db: Session) -> None:
        self.db = db

    def _to_domain(self, model: LibroModel) -> Libro:
        return Libro(
            titulo=model.titulo,
            añoPublicacion=model.añoPublicacion,
            editorial=model.editorial,
            edicion=model.edicion,
        )

    def getAll(self) -> List[Libro]:
        models = self.db.query(LibroModel).all()
        return [self._to_domain(m) for m in models]

    def getById(self, id: int) -> Optional[Libro]:
        model = self.db.query(LibroModel).filter(LibroModel.id == id).first()
        return self._to_domain(model) if model else None

    def create(self, entity: Libro) -> Libro:
        model = LibroModel(
            titulo=entity.titulo,
            añoPublicacion=entity.añoPublicacion,
            editorial=entity.editorial,
            edicion=entity.edicion,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def update(self, id: int, entity: Libro) -> Optional[Libro]:
        model = self.db.query(LibroModel).filter(LibroModel.id == id).first()
        if not model:
            return None
        model.titulo = entity.titulo
        model.añoPublicacion = entity.añoPublicacion
        model.editorial = entity.editorial
        model.edicion = entity.edicion
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def delete(self, id: int) -> bool:
        model = self.db.query(LibroModel).filter(LibroModel.id == id).first()
        if not model:
            return False
        self.db.delete(model)
        self.db.commit()
        return True
