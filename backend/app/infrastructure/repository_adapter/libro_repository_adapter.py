from typing import List, Optional
from app.domain.entity.libro import Libro
from app.domain.repository.libro_repository_i import LibroRepositoryI
from app.infrastructure.postgres.mapper.libro_entity_mapper import LibroEntityMapper
from app.infrastructure.postgres.model.autor_model import AutorModel
from app.infrastructure.postgres.model.libro_model import LibroModel
from app.infrastructure.postgres.repository.postgres_libro_repository import PostgresLibroRepository
from app.infrastructure.repository_adapter.base_repository_adapter import BaseRepositoryAdapter


class LibroRepositoryAdapter(BaseRepositoryAdapter[Libro, LibroModel], LibroRepositoryI):
    def __init__(self, repository: PostgresLibroRepository) -> None:
        super().__init__(repository, LibroEntityMapper)

    def get_all_filtered(
        self,
        titulo: Optional[str] = None,
        autor: Optional[str] = None,
        editorial: Optional[str] = None,
    ) -> List[Libro]:
        return LibroEntityMapper.to_domain_list(
            self.repository.find_all_filtered(titulo=titulo, autor=autor, editorial=editorial)
        )

    def save(self, entity: Libro) -> Libro:
        model = LibroEntityMapper.to_model(entity)
        if entity.autor_ids:
            model.autores = (
                self.repository.db.query(AutorModel)
                .filter(AutorModel.id.in_(entity.autor_ids))
                .all()
            )
        saved = self.repository.save(model)
        return LibroEntityMapper.to_domain(saved)

    def update(self, id: int, entity: Libro) -> Optional[Libro]:
        existing = self.repository.find_by_id(id)
        if existing is None:
            return None
        existing.titulo = entity.titulo
        existing.añoPublicacion = entity.añoPublicacion
        existing.editorial = entity.editorial
        existing.edicion = entity.edicion
        if entity.autor_ids is not None:
            existing.autores = (
                self.repository.db.query(AutorModel)
                .filter(AutorModel.id.in_(entity.autor_ids))
                .all()
                if entity.autor_ids
                else []
            )
        self.repository.db.commit()
        self.repository.db.refresh(existing)
        return LibroEntityMapper.to_domain(existing)
