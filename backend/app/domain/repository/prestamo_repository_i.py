from abc import abstractmethod
from typing import List, Optional
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.prestamo import Prestamo
from app.domain.repository.base_repository_i import BaseRepositoryI


class PrestamoRepositoryI(BaseRepositoryI[Prestamo]):
    @abstractmethod
    def get_all_filtered(
        self,
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoPrestamo] = None,
    ) -> List[Prestamo]:
        pass
