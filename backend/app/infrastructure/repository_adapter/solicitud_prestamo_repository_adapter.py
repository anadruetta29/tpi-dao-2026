from typing import List, Optional
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.domain.repository.solicitud_prestamo_repository_i import SolicitudPrestamoRepositoryI
from app.infrastructure.postgres.mapper.solicitud_prestamo_entity_mapper import SolicitudPrestamoEntityMapper
from app.infrastructure.postgres.model.solicitud_prestamo_model import SolicitudPrestamoModel
from app.infrastructure.postgres.repository.postgres_solicitud_prestamo_repository import (
    PostgresSolicitudPrestamoRepository,
)
from app.infrastructure.repository_adapter.base_repository_adapter import BaseRepositoryAdapter


class SolicitudPrestamoRepositoryAdapter(
    BaseRepositoryAdapter[SolicitudPrestamo, SolicitudPrestamoModel],
    SolicitudPrestamoRepositoryI,
):
    def __init__(self, repository: PostgresSolicitudPrestamoRepository) -> None:
        super().__init__(repository, SolicitudPrestamoEntityMapper)

    def get_all_filtered(
        self,
        tipo: Optional[TipoPrestamo] = None,
        estado: Optional[EstadoSolicitud] = None,
        sede_id: Optional[int] = None,
    ) -> List[SolicitudPrestamo]:
        return SolicitudPrestamoEntityMapper.to_domain_list(
            self.repository.find_all_filtered(tipo=tipo, estado=estado, sede_id=sede_id)
        )
