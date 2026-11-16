from typing import List, Optional
from sqlalchemy.orm import Session
from app.infrastructure.database import flush_or_commit
from app.infrastructure.postgres.model.tarifa_multa_model import TarifaMultaModel


class PostgresTarifaMultaRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_all(self) -> List[TarifaMultaModel]:
        return self.db.query(TarifaMultaModel).all()

    def find_by_motivo(self, motivo: str) -> Optional[TarifaMultaModel]:
        return self.db.get(TarifaMultaModel, motivo)

    def save_or_update(self, model: TarifaMultaModel) -> TarifaMultaModel:
        existing = self.db.get(TarifaMultaModel, model.motivo)
        if existing is None:
            self.db.add(model)
            target = model
        else:
            existing.monto = model.monto
            target = existing
        flush_or_commit(self.db)
        self.db.refresh(target)
        return target
