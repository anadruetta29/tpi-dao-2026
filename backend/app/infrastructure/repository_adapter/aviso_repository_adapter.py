from typing import List, Optional
from app.domain.entity.aviso import Aviso
from app.domain.repository.aviso_repository_i import AvisoRepositoryI
from app.infrastructure.postgres.mapper.aviso_entity_mapper import AvisoEntityMapper
from app.infrastructure.postgres.model.aviso_model import AvisoModel
from app.infrastructure.postgres.repository.postgres_aviso_repository import PostgresAvisoRepository
from app.infrastructure.repository_adapter.base_repository_adapter import BaseRepositoryAdapter


class AvisoRepositoryAdapter(BaseRepositoryAdapter[Aviso, AvisoModel], AvisoRepositoryI):
    def __init__(self, repository: PostgresAvisoRepository) -> None:
        super().__init__(repository, AvisoEntityMapper)

    def crear_si_nuevo(self, aviso: Aviso) -> None:
        self.repository.crear_si_nuevo(self.mapper.to_model(aviso))

    def listar(self, usuario_id: int, sede_id: Optional[int]) -> List[Aviso]:
        return [self.mapper.to_domain(model, leido) for model, leido in self.repository.listar(usuario_id, sede_id)]

    def marcar_leido(self, id: int, usuario_id: int, sede_id: Optional[int]) -> Optional[Aviso]:
        model = self.repository.marcar_leido(id, usuario_id, sede_id)
        return self.mapper.to_domain(model, True) if model is not None else None

    def get_ids_sin_email(self) -> List[int]:
        return self.repository.get_ids_sin_email()

    def actualizar_email(self, aviso: Aviso) -> None:
        self.update(aviso.id, aviso)
