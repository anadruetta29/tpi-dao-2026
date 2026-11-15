from typing import List, Optional, Tuple
from sqlalchemy import and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.infrastructure.postgres.model.aviso_model import AvisoLecturaModel, AvisoModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresAvisoRepository(BasePostgresRepository[AvisoModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, AvisoModel)

    def crear_si_nuevo(self, model: AvisoModel) -> None:
        existe = self.db.query(AvisoModel.id).filter(AvisoModel.clave == model.clave)
        if existe.first() is not None:
            return
        try:
            with self.db.begin_nested():
                self.db.add(model)
                self.db.flush()
        except IntegrityError:
            if existe.first() is None:
                raise

    def listar(self, usuario_id: int, sede_id: Optional[int]) -> List[Tuple[AvisoModel, bool]]:
        query = self.db.query(AvisoModel, AvisoLecturaModel.usuario_id.is_not(None)).outerjoin(
            AvisoLecturaModel,
            and_(AvisoLecturaModel.aviso_id == AvisoModel.id, AvisoLecturaModel.usuario_id == usuario_id),
        )
        if sede_id is not None:
            query = query.filter(AvisoModel.sede_id == sede_id)
        return query.order_by(AvisoModel.fecha.desc(), AvisoModel.id.desc()).all()

    def marcar_leido(self, id: int, usuario_id: int, sede_id: Optional[int]) -> Optional[AvisoModel]:
        model = self.find_by_id_for_update(id)
        if model is None or (sede_id is not None and model.sede_id != sede_id):
            return None
        if self.db.get(AvisoLecturaModel, (id, usuario_id)) is None:
            self.db.add(AvisoLecturaModel(aviso_id=id, usuario_id=usuario_id))
            self.db.flush()
        return model

    def get_ids_sin_email(self) -> List[int]:
        filas = self.db.query(AvisoModel.id).filter(AvisoModel.fecha_email.is_(None), AvisoModel.socio_id.is_not(None))
        return [id for (id,) in filas.order_by(AvisoModel.id).all()]
