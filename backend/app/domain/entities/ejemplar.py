from typing import Optional
from app.domain.entities.estado_ejemplar import EstadoEjemplar


class Ejemplar:
    def __init__(
        self,
        codigo: Optional[str] = None,
        estado: Optional[EstadoEjemplar] = None,
    ) -> None:
        self.codigo = codigo
        self.estado = estado
