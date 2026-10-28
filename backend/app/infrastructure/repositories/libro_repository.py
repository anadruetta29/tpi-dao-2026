from app.domain.entities.libro import Libro
from app.domain.datasources.base_datasource import BaseDatasource
from app.infrastructure.repositories.base_repository_adapter import BaseRepositoryAdapter


class LibroRepository(BaseRepositoryAdapter[Libro]):
    def __init__(self, datasource: BaseDatasource[Libro]) -> None:
        super().__init__(datasource)
