from app.domain.entities.multa import Multa
from app.domain.datasources.base_datasource import BaseDatasource
from app.infrastructure.repositories.base_repository_adapter import BaseRepositoryAdapter


class MultaRepository(BaseRepositoryAdapter[Multa]):
    def __init__(self, datasource: BaseDatasource[Multa]) -> None:
        super().__init__(datasource)
