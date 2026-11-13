from typing import Dict
from app.application.strategy.solicitud_tipo.core.solicitud_tipo_strategy import (
    SolicitudTipoStrategy,
)
from app.application.strategy.solicitud_tipo.implementation.interbibliotecaria_solicitud_strategy import (
    InterbibliotecariaSolicitudStrategy,
)
from app.application.strategy.solicitud_tipo.implementation.local_solicitud_strategy import (
    LocalSolicitudStrategy,
)
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class SolicitudTipoStrategyFactory:
    def __init__(self) -> None:
        self._strategies: Dict[TipoPrestamo, SolicitudTipoStrategy] = {
            TipoPrestamo.LOCAL: LocalSolicitudStrategy(),
            TipoPrestamo.INTERBIBLIOTECARIO: InterbibliotecariaSolicitudStrategy(),
        }

    def get_strategy(self, tipo: TipoPrestamo) -> SolicitudTipoStrategy:
        strategy = self._strategies.get(tipo)
        if strategy is None:
            raise ErrorHandler(ErrorType.BAD_REQUEST, "Tipo de solicitud no soportado.")
        return strategy
