from app.application.strategy.ejemplar_estado.core.ejemplar_estado_state import (
    EjemplarEstadoState,
)


class PrestadoState(EjemplarEstadoState):
    def puede_reservarse(self) -> bool:
        return True

    def puede_devolverse(self) -> bool:
        return True
