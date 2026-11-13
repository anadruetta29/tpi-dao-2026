from abc import abstractmethod
from typing import List, Optional
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.domain.repository.base_repository_i import BaseRepositoryI


class SolicitudPrestamoRepositoryI(BaseRepositoryI[SolicitudPrestamo]):
    @abstractmethod
    def get_all_filtered(
        self,
        tipo: Optional[TipoPrestamo] = None,
        estado: Optional[EstadoSolicitud] = None,
        sede_id: Optional[int] = None,
    ) -> List[SolicitudPrestamo]:
        pass
