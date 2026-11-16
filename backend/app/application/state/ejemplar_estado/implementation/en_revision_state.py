from app.application.state.ejemplar_estado.core.ejemplar_estado_state import (
    EjemplarEstadoState,
)


class EnRevisionState(EjemplarEstadoState):
    def puede_devolverse(self) -> bool:
        return True

    def puede_resolver_revision(self) -> bool:
        return True
