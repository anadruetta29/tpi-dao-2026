from typing import List, Optional
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.prestamo import Prestamo
from app.domain.repository.prestamo_repository_i import PrestamoRepositoryI
from app.infrastructure.postgres.mapper.prestamo_entity_mapper import PrestamoEntityMapper
from app.infrastructure.postgres.model.prestamo_model import PrestamoModel
from app.infrastructure.postgres.repository.postgres_prestamo_repository import PostgresPrestamoRepository
from app.infrastructure.repository_adapter.base_repository_adapter import BaseRepositoryAdapter


class PrestamoRepositoryAdapter(BaseRepositoryAdapter[Prestamo, PrestamoModel], PrestamoRepositoryI):
    def __init__(self, repository: PostgresPrestamoRepository) -> None:
        super().__init__(repository, PrestamoEntityMapper)

    def get_all_filtered(
        self,
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoPrestamo] = None,
    ) -> List[Prestamo]:
        return PrestamoEntityMapper.to_domain_list(
            self.repository.find_all_filtered(socio_id=socio_id, sede_id=sede_id, estado=estado)
        )
