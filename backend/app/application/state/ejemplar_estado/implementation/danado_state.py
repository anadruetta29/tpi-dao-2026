from app.application.state.ejemplar_estado.core.ejemplar_estado_state import (
    EjemplarEstadoState,
)


class DanadoState(EjemplarEstadoState):
    def puede_resolver_revision(self) -> bool:
        return True
