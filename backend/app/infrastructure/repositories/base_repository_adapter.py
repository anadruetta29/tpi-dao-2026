from typing import Generic, List, Optional, TypeVar
from app.domain.datasources.base_datasource import BaseDatasource
from app.domain.repositories.base_repository import BaseRepository

T = TypeVar("T")


class BaseRepositoryAdapter(BaseRepository[T], Generic[T]):
    def __init__(self, datasource: BaseDatasource[T]) -> None:
        self.datasource = datasource

    def set_datasource(self, datasource: BaseDatasource[T]) -> None:
        self.datasource = datasource

    def getAll(self) -> List[T]:
        return self.datasource.getAll()

    def getById(self, id: int) -> Optional[T]:
        return self.datasource.getById(id)

    def create(self, entity: T) -> T:
        return self.datasource.create(entity)

    def update(self, id: int, entity: T) -> Optional[T]:
        return self.datasource.update(id, entity)

    def delete(self, id: int) -> bool:
        return self.datasource.delete(id)
