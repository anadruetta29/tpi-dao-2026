from app.application.state.ejemplar.core.ejemplar import (
    EjemplarEstadoState,
)


class ReservadoState(EjemplarEstadoState):
    def puede_devolverse(self) -> bool:
        return True

    def puede_eliminarse(self) -> bool:
        return False
