from datetime import date
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

    def get_by_solicitud_id(self, solicitud_id: int) -> Optional[Prestamo]:
        model = self.repository.find_by_solicitud_id(solicitud_id)
        return self.mapper.to_domain(model) if model is not None else None

    def get_ids_vencidos(self, fecha: date) -> List[int]:
        return self.repository.find_ids_vencidos(fecha)

    def get_by_id(self, id: int, sede_recepcionista_id: Optional[int] = None) -> Optional[Prestamo]:
        model = self.repository.find_by_id(id, sede_recepcionista_id)
        return self.mapper.to_domain(model) if model is not None else None

    def get_by_id_for_update(self, id: int) -> Optional[Prestamo]:
        model = self.repository.find_by_id_for_update(id)
        return self.mapper.to_domain(model) if model is not None else None

    def get_all_filtered(
        self,
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoPrestamo] = None,
        sede_recepcionista_id: Optional[int] = None,
    ) -> List[Prestamo]:
        return PrestamoEntityMapper.to_domain_list(
            self.repository.find_all_filtered(
                socio_id=socio_id, sede_id=sede_id, estado=estado, sede_recepcionista_id=sede_recepcionista_id,
            )
        )
