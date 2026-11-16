from abc import ABC, abstractmethod
from datetime import date
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.remito import Remito
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class RemitoEstadoState(ABC):
    def empacar(self) -> EstadoEnvio:
        raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)

    @abstractmethod
    def despachar(self, remito: Remito, fecha_despacho: date) -> EstadoEnvio:
        pass

    @abstractmethod
    def recibir(
        self, remito: Remito, fecha_recepcion: date, con_incidencia: bool
    ) -> EstadoEnvio:
        pass
