from typing import Dict
from app.application.strategy.ejemplar_estado.core.ejemplar_estado_state import (
    EjemplarEstadoState,
)
from app.application.strategy.ejemplar_estado.implementation.danado_state import (
    DanadoState,
)
from app.application.strategy.ejemplar_estado.implementation.destruido_state import (
    DestruidoState,
)
from app.application.strategy.ejemplar_estado.implementation.disponible_state import (
    DisponibleState,
)
from app.application.strategy.ejemplar_estado.implementation.en_revision_state import (
    EnRevisionState,
)
from app.application.strategy.ejemplar_estado.implementation.en_transito_state import (
    EnTransitoEjemplarState,
)
from app.application.strategy.ejemplar_estado.implementation.extraviado_state import (
    ExtraviadoState,
)
from app.application.strategy.ejemplar_estado.implementation.prestado_state import (
    PrestadoState,
)
from app.application.strategy.ejemplar_estado.implementation.reservado_state import (
    ReservadoState,
)
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class EjemplarEstadoStateFactory:
    def __init__(self) -> None:
        self._states: Dict[EstadoEjemplar, EjemplarEstadoState] = {
            EstadoEjemplar.DISPONIBLE: DisponibleState(),
            EstadoEjemplar.PRESTADO: PrestadoState(),
            EstadoEjemplar.RESERVADO: ReservadoState(),
            EstadoEjemplar.EN_TRANSITO: EnTransitoEjemplarState(),
            EstadoEjemplar.EN_REVISION: EnRevisionState(),
            EstadoEjemplar.DANADO: DanadoState(),
            EstadoEjemplar.EXTRAVIADO: ExtraviadoState(),
            EstadoEjemplar.DESTRUIDO: DestruidoState(),
        }

    def get_state(self, estado: EstadoEjemplar) -> EjemplarEstadoState:
        state = self._states.get(estado)
        if state is None:
            raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)
        return state
