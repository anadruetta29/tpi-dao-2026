from typing import List, Optional
from app.domain.entity.estado_socio import EstadoSocio
from app.domain.entity.socio import Socio
from app.domain.repository.socio_repository_i import SocioRepositoryI
from app.infrastructure.postgres.mapper.socio_entity_mapper import SocioEntityMapper
from app.infrastructure.postgres.model.socio_model import SocioModel
from app.infrastructure.postgres.repository.postgres_socio_repository import PostgresSocioRepository
from app.infrastructure.repository_adapter.base_repository_adapter import BaseRepositoryAdapter


class SocioRepositoryAdapter(BaseRepositoryAdapter[Socio, SocioModel], SocioRepositoryI):
    def __init__(self, repository: PostgresSocioRepository) -> None:
        super().__init__(repository, SocioEntityMapper)

    def get_all_filtered(
        self,
        q: Optional[str] = None,
        documento: Optional[str] = None,
        estado: Optional[EstadoSocio] = None,
    ) -> List[Socio]:
        return SocioEntityMapper.to_domain_list(
            self.repository.find_all_filtered(q=q, documento=documento, estado=estado)
        )

    def get_by_documento(self, documento: str) -> Optional[Socio]:
        model = self.repository.find_by_documento(documento)
        return SocioEntityMapper.to_domain(model) if model is not None else None

    def get_by_email(self, email: str) -> Optional[Socio]:
        model = self.repository.find_by_email(email)
        return SocioEntityMapper.to_domain(model) if model is not None else None
