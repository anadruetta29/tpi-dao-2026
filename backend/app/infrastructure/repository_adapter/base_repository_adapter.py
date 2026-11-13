from typing import Generic, List, Optional, TypeVar
from app.domain.repository.base_repository_i import BaseRepositoryI
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository

T = TypeVar("T")
M = TypeVar("M")


class BaseRepositoryAdapter(BaseRepositoryI[T], Generic[T, M]):
    def __init__(self, repository: BasePostgresRepository[M], mapper) -> None:
        self.repository = repository
        self.mapper = mapper

    def get_all(self) -> List[T]:
        return self.mapper.to_domain_list(self.repository.find_all())

    def get_by_id(self, id: int) -> Optional[T]:
        model = self.repository.find_by_id(id)
        return self.mapper.to_domain(model) if model is not None else None

    def save(self, entity: T) -> T:
        model = self.mapper.to_model(entity)
        saved = self.repository.save(model)
        return self.mapper.to_domain(saved)

    def update(self, id: int, entity: T) -> Optional[T]:
        existing = self.repository.find_by_id(id)
        if existing is None:
            return None
        model = self.mapper.to_model(entity)
        for col in existing.__table__.columns:
            if col.name != "id":
                setattr(existing, col.name, getattr(model, col.name))
        self.repository.db.commit()
        self.repository.db.refresh(existing)
        return self.mapper.to_domain(existing)

    def delete(self, id: int) -> bool:
        return self.repository.delete_by_id(id)
