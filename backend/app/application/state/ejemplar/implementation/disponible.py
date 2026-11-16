from app.application.state.ejemplar.core.ejemplar import (
    EjemplarEstadoState,
)


class DisponibleState(EjemplarEstadoState):
    def puede_prestarse(self) -> bool:
        return True

    def puede_enviarse(self) -> bool:
        return True

    def puede_reservarse(self) -> bool:
        return True
