from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entity.rol import Rol
from app.infrastructure.postgres.model.usuario_model import UsuarioModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresUsuarioRepository(BasePostgresRepository[UsuarioModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, UsuarioModel)

    def find_by_email(self, email: str) -> Optional[UsuarioModel]:
        return self.db.query(UsuarioModel).filter(UsuarioModel.email == email).first()

    def find_all_filtered(
        self,
        role: Optional[Rol] = None,
        activo: Optional[bool] = None,
    ) -> List[UsuarioModel]:
        query = self.db.query(UsuarioModel)
        if role is not None:
            query = query.filter(UsuarioModel.role == role)
        if activo is not None:
            query = query.filter(UsuarioModel.activo == activo)
        return query.all()
