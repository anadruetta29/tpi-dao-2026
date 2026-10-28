from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.datasources.base_datasource import BaseDatasource
from app.domain.entities.usuario import Usuario
from app.infrastructure.models.usuario_model import UsuarioModel


class UsuarioPostgresDatasource(BaseDatasource[Usuario]):
    def __init__(self, db: Session) -> None:
        self.db = db

    def _to_domain(self, model: UsuarioModel) -> Usuario:
        return Usuario(
            nombre=model.nombre,
            apellido=model.apellido,
            email=model.email,
            password=model.password,
            activo=model.activo,
            role=model.role,
        )

    def getAll(self) -> List[Usuario]:
        models = self.db.query(UsuarioModel).all()
        return [self._to_domain(m) for m in models]

    def getById(self, id: int) -> Optional[Usuario]:
        model = self.db.query(UsuarioModel).filter(UsuarioModel.id == id).first()
        return self._to_domain(model) if model else None

    def create(self, entity: Usuario) -> Usuario:
        model = UsuarioModel(
            nombre=entity.nombre,
            apellido=entity.apellido,
            email=entity.email,
            password=entity.password,
            activo=entity.activo,
            role=entity.role,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def update(self, id: int, entity: Usuario) -> Optional[Usuario]:
        model = self.db.query(UsuarioModel).filter(UsuarioModel.id == id).first()
        if not model:
            return None
        model.nombre = entity.nombre
        model.apellido = entity.apellido
        model.email = entity.email
        model.password = entity.password
        model.activo = entity.activo
        model.role = entity.role
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def delete(self, id: int) -> bool:
        model = self.db.query(UsuarioModel).filter(UsuarioModel.id == id).first()
        if not model:
            return False
        self.db.delete(model)
        self.db.commit()
        return True
