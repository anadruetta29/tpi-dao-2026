from abc import abstractmethod
from datetime import date
from typing import List, Optional
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.reserva import Reserva
from app.domain.repository.base_repository_i import BaseRepositoryI


class ReservaRepositoryI(BaseRepositoryI[Reserva]):
    @abstractmethod
    def get_pendientes_for_update(self, libro_id: int, sede_id: Optional[int], ejemplar_id: int) -> List[Reserva]:
        pass

    @abstractmethod
    def get_ids_por_vencer_retiro(self, hoy: date) -> List[int]:
        pass

    @abstractmethod
    def get_all_filtered(
        self,
        libro_id: Optional[int] = None,
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoReserva] = None,
    ) -> List[Reserva]:
        pass
