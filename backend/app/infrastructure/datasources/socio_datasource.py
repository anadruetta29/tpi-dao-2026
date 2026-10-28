from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.datasources.base_datasource import BaseDatasource
from app.domain.entities.socio import Socio
from app.infrastructure.models.socio_model import SocioModel


class SocioPostgresDatasource(BaseDatasource[Socio]):
    def __init__(self, db: Session) -> None:
        self.db = db

    def _to_domain(self, model: SocioModel) -> Socio:
        return Socio(
            nombre=model.nombre,
            apellido=model.apellido,
            documento=model.documento,
            email=model.email,
            telefono=model.telefono,
            estado=model.estado,
        )

    def getAll(self) -> List[Socio]:
        models = self.db.query(SocioModel).all()
        return [self._to_domain(m) for m in models]

    def getById(self, id: int) -> Optional[Socio]:
        model = self.db.query(SocioModel).filter(SocioModel.id == id).first()
        return self._to_domain(model) if model else None

    def create(self, entity: Socio) -> Socio:
        model = SocioModel(
            nombre=entity.nombre,
            apellido=entity.apellido,
            documento=entity.documento,
            email=entity.email,
            telefono=entity.telefono,
            estado=entity.estado,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def update(self, id: int, entity: Socio) -> Optional[Socio]:
        model = self.db.query(SocioModel).filter(SocioModel.id == id).first()
        if not model:
            return None
        model.nombre = entity.nombre
        model.apellido = entity.apellido
        model.documento = entity.documento
        model.email = entity.email
        model.telefono = entity.telefono
        model.estado = entity.estado
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def delete(self, id: int) -> bool:
        model = self.db.query(SocioModel).filter(SocioModel.id == id).first()
        if not model:
            return False
        self.db.delete(model)
        self.db.commit()
        return True
