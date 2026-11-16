from typing import Dict
from app.application.state.ejemplar.core.ejemplar import (
    EjemplarEstadoState,
)
from app.application.state.ejemplar.implementation.danado import (
    DanadoState,
)
from app.application.state.ejemplar.implementation.destruido import (
    DestruidoState,
)
from app.application.state.ejemplar.implementation.disponible import (
    DisponibleState,
)
from app.application.state.ejemplar.implementation.en_revision import (
    EnRevisionState,
)
from app.application.state.ejemplar.implementation.en_transito import (
    EnTransitoEjemplarState,
)
from app.application.state.ejemplar.implementation.extraviado import (
    ExtraviadoState,
)
from app.application.state.ejemplar.implementation.prestado import (
    PrestadoState,
)
from app.application.state.ejemplar.implementation.reservado import (
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
