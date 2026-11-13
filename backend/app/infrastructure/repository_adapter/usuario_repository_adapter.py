from typing import List, Optional
from app.domain.entity.rol import Rol
from app.domain.entity.usuario import Usuario
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI
from app.infrastructure.postgres.mapper.usuario_entity_mapper import UsuarioEntityMapper
from app.infrastructure.postgres.model.usuario_model import UsuarioModel
from app.infrastructure.postgres.repository.postgres_usuario_repository import PostgresUsuarioRepository
from app.infrastructure.repository_adapter.base_repository_adapter import BaseRepositoryAdapter


class UsuarioRepositoryAdapter(BaseRepositoryAdapter[Usuario, UsuarioModel], UsuarioRepositoryI):
    def __init__(self, repository: PostgresUsuarioRepository) -> None:
        super().__init__(repository, UsuarioEntityMapper)

    def get_by_email(self, email: str) -> Optional[Usuario]:
        model = self.repository.find_by_email(email)
        return UsuarioEntityMapper.to_domain(model) if model is not None else None

    def get_all_filtered(
        self,
        role: Optional[Rol] = None,
        activo: Optional[bool] = None,
    ) -> List[Usuario]:
        return UsuarioEntityMapper.to_domain_list(self.repository.find_all_filtered(role=role, activo=activo))
