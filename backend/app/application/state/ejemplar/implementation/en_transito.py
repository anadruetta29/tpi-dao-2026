from app.application.state.ejemplar.core.ejemplar import (
    EjemplarEstadoState,
)


class EnTransitoEjemplarState(EjemplarEstadoState):
    def puede_reservarse(self) -> bool:
        return True

    def puede_devolverse(self) -> bool:
        return True
