from app.domain.entities.prestamo import Prestamo
from app.domain.datasources.base_datasource import BaseDatasource
from app.infrastructure.repositories.base_repository_adapter import BaseRepositoryAdapter


class PrestamoRepository(BaseRepositoryAdapter[Prestamo]):
    def __init__(self, datasource: BaseDatasource[Prestamo]) -> None:
        super().__init__(datasource)
