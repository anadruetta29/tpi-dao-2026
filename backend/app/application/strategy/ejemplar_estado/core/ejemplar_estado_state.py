from abc import ABC
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class EjemplarEstadoState(ABC):
    def puede_prestarse(self) -> bool:
        return False

    def puede_enviarse(self) -> bool:
        return False

    def puede_reservarse(self) -> bool:
        return False

    def puede_devolverse(self) -> bool:
        return False

    def validar_prestamo(self, ejemplar: Ejemplar) -> None:
        if not self.puede_prestarse():
            raise ErrorHandler(ErrorType.EJEMPLAR_NOT_AVAILABLE)

    def validar_envio(self, ejemplar: Ejemplar) -> None:
        if not self.puede_enviarse():
            raise ErrorHandler(ErrorType.EJEMPLAR_NOT_AVAILABLE)

    def validar_reserva(self, ejemplar: Ejemplar) -> None:
        if not self.puede_reservarse():
            raise ErrorHandler(ErrorType.EJEMPLAR_NOT_AVAILABLE)

    def prestar(self, ejemplar: Ejemplar) -> None:
        self.validar_prestamo(ejemplar)
        ejemplar.estado = EstadoEjemplar.PRESTADO

    def devolver(self, ejemplar: Ejemplar, nuevo_estado: EstadoEjemplar) -> None:
        if not self.puede_devolverse():
            raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION)
        ejemplar.estado = nuevo_estado
