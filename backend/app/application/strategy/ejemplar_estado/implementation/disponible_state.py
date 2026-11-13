from app.application.strategy.ejemplar_estado.core.ejemplar_estado_state import (
    EjemplarEstadoState,
)


class DisponibleState(EjemplarEstadoState):
    def puede_prestarse(self) -> bool:
        return True

    def puede_enviarse(self) -> bool:
        return True

    def puede_reservarse(self) -> bool:
        return True
