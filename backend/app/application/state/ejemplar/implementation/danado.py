from app.application.state.ejemplar.core.ejemplar import EjemplarEstadoState
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class DanadoState(EjemplarEstadoState):
    def validar_eliminacion(
        self,
        mensaje: str = "No se puede eliminar un ejemplar prestado, reservado o en tránsito.",
    ) -> None:
        return None

    def validar_prestamo(self, ejemplar: Ejemplar) -> None:
        raise ErrorHandler(ErrorType.EJEMPLAR_NOT_AVAILABLE)

    def validar_envio(self, ejemplar: Ejemplar) -> None:
        raise ErrorHandler(ErrorType.EJEMPLAR_NOT_AVAILABLE)

    def validar_reserva(self, ejemplar: Ejemplar) -> None:
        raise ErrorHandler(ErrorType.EJEMPLAR_NOT_AVAILABLE)

    def prestar(self, ejemplar: Ejemplar) -> None:
        raise ErrorHandler(ErrorType.EJEMPLAR_NOT_AVAILABLE)

    def devolver(self, ejemplar: Ejemplar, nuevo_estado: EstadoEjemplar) -> None:
        raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)

    def resolver_revision(self, ejemplar: Ejemplar, nuevo_estado: EstadoEjemplar) -> None:
        if nuevo_estado not in (EstadoEjemplar.DISPONIBLE, EstadoEjemplar.DESTRUIDO):
            raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)
        ejemplar.estado = nuevo_estado
