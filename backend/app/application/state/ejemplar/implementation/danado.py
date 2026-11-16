from app.application.state.ejemplar.core.ejemplar import (
    EjemplarEstadoState,
)


class DanadoState(EjemplarEstadoState):
    def puede_resolver_revision(self) -> bool:
        return True
