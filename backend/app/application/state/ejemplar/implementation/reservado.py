from app.application.state.ejemplar.core.ejemplar import (
    EjemplarEstadoState,
)


class ReservadoState(EjemplarEstadoState):
    def puede_devolverse(self) -> bool:
        return True
