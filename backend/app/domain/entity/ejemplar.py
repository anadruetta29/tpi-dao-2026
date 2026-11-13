from typing import Optional
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class Ejemplar:
    def __init__(
        self,
        id: Optional[int] = None,
        codigo: Optional[str] = None,
        estado: Optional[EstadoEjemplar] = None,
        libro_id: Optional[int] = None,
        sede_id: Optional[int] = None,
    ) -> None:
        self.id = id
        self.codigo = codigo
        self.estado = estado
        self.libro_id = libro_id
        self.sede_id = sede_id

    def pertenece_a_sede(self, sede_id: Optional[int]) -> bool:
        return self.sede_id == sede_id

    def validar_en_sede(
        self,
        sede_id: Optional[int],
        mensaje: str = "El ejemplar no pertenece a la sede indicada.",
    ) -> None:
        if not self.pertenece_a_sede(sede_id):
            raise ErrorHandler(ErrorType.BAD_REQUEST, mensaje)

    def marcar_en_transito(self) -> None:
        self.estado = EstadoEjemplar.EN_TRANSITO

    def recibir_en_sede(self, sede_destino_id: Optional[int]) -> None:
        self.estado = EstadoEjemplar.DISPONIBLE
        if sede_destino_id is not None:
            self.sede_id = sede_destino_id

    def reservar(self) -> None:
        self.estado = EstadoEjemplar.RESERVADO
