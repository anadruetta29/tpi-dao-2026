from abc import ABC, abstractmethod
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar


class EjemplarEstadoState(ABC):
    @abstractmethod
    def validar_eliminacion(
        self,
        mensaje: str = "No se puede eliminar un ejemplar prestado, reservado o en tránsito.",
    ) -> None:
        pass

    @abstractmethod
    def validar_prestamo(self, ejemplar: Ejemplar) -> None:
        pass

    @abstractmethod
    def validar_envio(self, ejemplar: Ejemplar) -> None:
        pass

    @abstractmethod
    def validar_reserva(self, ejemplar: Ejemplar) -> None:
        pass

    @abstractmethod
    def prestar(self, ejemplar: Ejemplar) -> None:
        pass

    @abstractmethod
    def devolver(self, ejemplar: Ejemplar, nuevo_estado: EstadoEjemplar) -> None:
        pass

    @abstractmethod
    def resolver_revision(self, ejemplar: Ejemplar, nuevo_estado: EstadoEjemplar) -> None:
        pass
