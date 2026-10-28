from app.domain.entities.ejemplar import Ejemplar
from app.domain.datasources.base_datasource import BaseDatasource
from app.infrastructure.repositories.base_repository_adapter import BaseRepositoryAdapter


class EjemplarRepository(BaseRepositoryAdapter[Ejemplar]):
    def __init__(self, datasource: BaseDatasource[Ejemplar]) -> None:
        super().__init__(datasource)
