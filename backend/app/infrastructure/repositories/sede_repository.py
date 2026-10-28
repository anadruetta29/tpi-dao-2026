from app.domain.entities.sede import Sede
from app.domain.datasources.base_datasource import BaseDatasource
from app.infrastructure.repositories.base_repository_adapter import BaseRepositoryAdapter


class SedeRepository(BaseRepositoryAdapter[Sede]):
    def __init__(self, datasource: BaseDatasource[Sede]) -> None:
        super().__init__(datasource)
