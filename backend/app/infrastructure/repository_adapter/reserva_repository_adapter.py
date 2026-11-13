from typing import List, Optional
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.reserva import Reserva
from app.domain.repository.reserva_repository_i import ReservaRepositoryI
from app.infrastructure.postgres.mapper.reserva_entity_mapper import ReservaEntityMapper
from app.infrastructure.postgres.model.reserva_model import ReservaModel
from app.infrastructure.postgres.repository.postgres_reserva_repository import PostgresReservaRepository
from app.infrastructure.repository_adapter.base_repository_adapter import BaseRepositoryAdapter


class ReservaRepositoryAdapter(BaseRepositoryAdapter[Reserva, ReservaModel], ReservaRepositoryI):
    def __init__(self, repository: PostgresReservaRepository) -> None:
        super().__init__(repository, ReservaEntityMapper)

    def get_all_filtered(
        self,
        libro_id: Optional[int] = None,
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoReserva] = None,
    ) -> List[Reserva]:
        return ReservaEntityMapper.to_domain_list(
            self.repository.find_all_filtered(
                libro_id=libro_id,
                socio_id=socio_id,
                sede_id=sede_id,
                estado=estado,
            )
        )
