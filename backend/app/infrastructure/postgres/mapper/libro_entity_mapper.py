from typing import List
from app.domain.entity.libro import Libro
from app.infrastructure.postgres.model.libro_model import LibroModel


class LibroEntityMapper:
    @staticmethod
    def to_domain(model: LibroModel) -> Libro:
        autor_ids = [a.id for a in (model.autores or []) if a.id is not None]
        return Libro(
            id=model.id,
            titulo=model.titulo,
            añoPublicacion=model.añoPublicacion,
            editorial=model.editorial,
            edicion=model.edicion,
            autor_ids=autor_ids,
        )

    @staticmethod
    def to_domain_list(models: List[LibroModel]) -> List[Libro]:
        return [LibroEntityMapper.to_domain(m) for m in models]

    @staticmethod
    def to_model(entity: Libro) -> LibroModel:
        return LibroModel(
            id=entity.id,
            titulo=entity.titulo,
            añoPublicacion=entity.añoPublicacion,
            editorial=entity.editorial,
            edicion=entity.edicion,
        )
