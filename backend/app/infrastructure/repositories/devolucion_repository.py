from app.domain.entities.devolucion import Devolucion
from app.domain.datasources.base_datasource import BaseDatasource
from app.infrastructure.repositories.base_repository_adapter import BaseRepositoryAdapter


class DevolucionRepository(BaseRepositoryAdapter[Devolucion]):
    def __init__(self, datasource: BaseDatasource[Devolucion]) -> None:
        super().__init__(datasource)
