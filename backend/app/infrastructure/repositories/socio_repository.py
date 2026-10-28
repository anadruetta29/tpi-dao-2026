from app.domain.entities.socio import Socio
from app.domain.datasources.base_datasource import BaseDatasource
from app.infrastructure.repositories.base_repository_adapter import BaseRepositoryAdapter


class SocioRepository(BaseRepositoryAdapter[Socio]):
    def __init__(self, datasource: BaseDatasource[Socio]) -> None:
        super().__init__(datasource)
