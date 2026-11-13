from datetime import date
from app.application.strategy.remito_estado.core.remito_estado_state import (
    RemitoEstadoState,
)
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.remito import Remito
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class DespachadoState(RemitoEstadoState):
    def despachar(self, remito: Remito, fecha_despacho: date) -> EstadoEnvio:
        raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)

    def recibir(
        self, remito: Remito, fecha_recepcion: date, con_incidencia: bool
    ) -> EstadoEnvio:
        remito.registrar_recepcion(fecha_recepcion)
        return EstadoEnvio.CON_INCIDENCIA if con_incidencia else EstadoEnvio.RECIBIDO
