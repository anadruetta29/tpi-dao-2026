from abc import abstractmethod
from datetime import date
from typing import List, Optional
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.prestamo import Prestamo
from app.domain.repository.base_repository_i import BaseRepositoryI


class PrestamoRepositoryI(BaseRepositoryI[Prestamo]):
    @abstractmethod
    def get_by_solicitud_id(self, solicitud_id: int) -> Optional[Prestamo]:
        pass

    @abstractmethod
    def get_ids_vencidos(self, fecha: date) -> List[int]:
        pass

    @abstractmethod
    def get_by_id(self, id: int, sede_recepcionista_id: Optional[int] = None) -> Optional[Prestamo]:
        pass

    @abstractmethod
    def get_by_id_for_update(self, id: int) -> Optional[Prestamo]:
        pass

    @abstractmethod
    def get_all_filtered(
        self,
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoPrestamo] = None,
        sede_recepcionista_id: Optional[int] = None,
    ) -> List[Prestamo]:
        pass
