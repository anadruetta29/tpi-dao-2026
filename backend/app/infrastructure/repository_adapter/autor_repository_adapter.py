from app.domain.entity.autor import Autor
from app.domain.repository.autor_repository_i import AutorRepositoryI
from app.infrastructure.postgres.mapper.autor_entity_mapper import AutorEntityMapper
from app.infrastructure.postgres.model.autor_model import AutorModel
from app.infrastructure.postgres.repository import PostgresAutorRepository
from app.infrastructure.repository_adapter.base_repository_adapter import BaseRepositoryAdapter


class AutorRepositoryAdapter(BaseRepositoryAdapter[Autor, AutorModel], AutorRepositoryI):
    def __init__(self, repository: PostgresAutorRepository) -> None:
        super().__init__(repository, AutorEntityMapper)
