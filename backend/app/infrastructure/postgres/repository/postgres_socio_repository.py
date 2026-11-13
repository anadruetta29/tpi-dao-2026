from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.domain.entity.estado_socio import EstadoSocio
from app.infrastructure.postgres.model.socio_model import SocioModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresSocioRepository(BasePostgresRepository[SocioModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, SocioModel)

    def find_all_filtered(
        self,
        q: Optional[str] = None,
        documento: Optional[str] = None,
        estado: Optional[EstadoSocio] = None,
    ) -> List[SocioModel]:
        query = self.db.query(SocioModel)
        if q is not None and q.strip():
            pattern = f"%{q.strip()}%"
            query = query.filter(
                or_(
                    SocioModel.nombre.ilike(pattern),
                    SocioModel.apellido.ilike(pattern),
                    SocioModel.email.ilike(pattern),
                    SocioModel.documento.ilike(pattern),
                )
            )
        if documento is not None and documento.strip():
            query = query.filter(SocioModel.documento == documento.strip())
        if estado is not None:
            query = query.filter(SocioModel.estado == estado)
        return query.all()

    def find_by_documento(self, documento: str) -> Optional[SocioModel]:
        return self.db.query(SocioModel).filter(SocioModel.documento == documento).first()

    def find_by_email(self, email: str) -> Optional[SocioModel]:
        return self.db.query(SocioModel).filter(SocioModel.email == email).first()
