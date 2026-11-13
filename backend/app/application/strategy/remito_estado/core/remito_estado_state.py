from abc import ABC, abstractmethod
from datetime import date
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.remito import Remito


class RemitoEstadoState(ABC):
    @abstractmethod
    def despachar(self, remito: Remito, fecha_despacho: date) -> EstadoEnvio:
        pass

    @abstractmethod
    def recibir(
        self, remito: Remito, fecha_recepcion: date, con_incidencia: bool
    ) -> EstadoEnvio:
        pass
