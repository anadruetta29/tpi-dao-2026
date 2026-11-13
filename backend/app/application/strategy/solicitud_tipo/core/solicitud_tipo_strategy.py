from abc import ABC, abstractmethod
from typing import Optional
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.repository.sede_repository_i import SedeRepositoryI


class SolicitudTipoStrategy(ABC):
    @abstractmethod
    def validar_sedes(
        self,
        sede_origen_id: int,
        sede_destino_id: Optional[int],
        sede_repository: SedeRepositoryI,
    ) -> int:
        pass

    @abstractmethod
    def construir_solicitud(
        self,
        socio_id: int,
        ejemplar_id: int,
        sede_origen_id: int,
        sede_destino_id: int,
        responsable_origen_id: Optional[int],
    ) -> SolicitudPrestamo:
        pass
