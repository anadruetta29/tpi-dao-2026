from app.application.state.ejemplar.core.ejemplar import (
    EjemplarEstadoState,
)


class EnRevisionState(EjemplarEstadoState):
    def puede_devolverse(self) -> bool:
        return True

    def puede_resolver_revision(self) -> bool:
        return True
