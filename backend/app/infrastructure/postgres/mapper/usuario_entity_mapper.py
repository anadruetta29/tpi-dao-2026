from typing import List
from app.domain.entity.usuario import Usuario
from app.infrastructure.postgres.model.usuario_model import UsuarioModel


class UsuarioEntityMapper:
    @staticmethod
    def to_domain(model: UsuarioModel) -> Usuario:
        return Usuario(
            id=model.id,
            nombre=model.nombre,
            apellido=model.apellido,
            email=model.email,
            password=model.password,
            activo=model.activo,
            role=model.role,
        )

    @staticmethod
    def to_domain_list(models: List[UsuarioModel]) -> List[Usuario]:
        return [UsuarioEntityMapper.to_domain(m) for m in models]

    @staticmethod
    def to_model(entity: Usuario) -> UsuarioModel:
        return UsuarioModel(
            id=entity.id,
            nombre=entity.nombre,
            apellido=entity.apellido,
            email=entity.email,
            password=entity.password,
            activo=entity.activo,
            role=entity.role,
        )
