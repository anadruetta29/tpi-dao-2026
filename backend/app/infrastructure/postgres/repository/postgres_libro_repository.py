from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.infrastructure.postgres.model.autor_model import AutorModel
from app.infrastructure.postgres.model.libro_model import LibroModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresLibroRepository(BasePostgresRepository[LibroModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, LibroModel)

    def find_all_filtered(
        self,
        titulo: Optional[str] = None,
        autor: Optional[str] = None,
        editorial: Optional[str] = None,
    ) -> List[LibroModel]:
        query = self.db.query(LibroModel)
        if titulo is not None and titulo.strip():
            query = query.filter(LibroModel.titulo.ilike(f"%{titulo.strip()}%"))
        if editorial is not None and editorial.strip():
            query = query.filter(LibroModel.editorial.ilike(f"%{editorial.strip()}%"))
        if autor is not None and autor.strip():
            pattern = f"%{autor.strip()}%"
            query = query.join(LibroModel.autores).filter(
                or_(
                    AutorModel.nombre.ilike(pattern),
                    AutorModel.apellido.ilike(pattern),
                )
            )
        return query.distinct().all()
