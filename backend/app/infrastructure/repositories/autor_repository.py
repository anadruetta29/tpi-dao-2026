from app.domain.entities.autor import Autor
from app.domain.datasources.base_datasource import BaseDatasource
from app.infrastructure.repositories.base_repository_adapter import BaseRepositoryAdapter


class AutorRepository(BaseRepositoryAdapter[Autor]):
    def __init__(self, datasource: BaseDatasource[Autor]) -> None:
        super().__init__(datasource)
