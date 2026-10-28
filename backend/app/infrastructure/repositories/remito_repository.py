from app.domain.entities.remito import Remito
from app.domain.datasources.base_datasource import BaseDatasource
from app.infrastructure.repositories.base_repository_adapter import BaseRepositoryAdapter


class RemitoRepository(BaseRepositoryAdapter[Remito]):
    def __init__(self, datasource: BaseDatasource[Remito]) -> None:
        super().__init__(datasource)
