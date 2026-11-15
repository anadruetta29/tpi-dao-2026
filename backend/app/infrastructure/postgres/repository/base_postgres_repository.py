from typing import Generic, List, Optional, Type, TypeVar
from sqlalchemy.orm import Session
from app.infrastructure.database import flush_or_commit

M = TypeVar("M")


class BasePostgresRepository(Generic[M]):
    def __init__(self, db: Session, model_cls: Type[M]) -> None:
        self.db = db
        self.model_cls = model_cls

    def find_all(self) -> List[M]:
        return self.db.query(self.model_cls).all()

    def find_by_id(self, id: int) -> Optional[M]:
        return self.db.query(self.model_cls).filter(self.model_cls.id == id).first()

    def find_by_id_for_update(self, id: int) -> Optional[M]:
        return (
            self.db.query(self.model_cls)
            .filter(self.model_cls.id == id)
            .with_for_update(of=self.model_cls)
            .first()
        )

    def save(self, model: M) -> M:
        self.db.add(model)
        flush_or_commit(self.db)
        self.db.refresh(model)
        return model

    def delete_by_id(self, id: int) -> bool:
        existing = self.find_by_id(id)
        if not existing:
            return False
        self.db.delete(existing)
        self.db.commit()
        return True
