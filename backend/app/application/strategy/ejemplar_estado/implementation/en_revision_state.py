from app.application.strategy.ejemplar_estado.core.ejemplar_estado_state import (
    EjemplarEstadoState,
)


class EnRevisionState(EjemplarEstadoState):
    def puede_devolverse(self) -> bool:
        return True
