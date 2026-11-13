from typing import Optional
from app.domain.entity.estado_ejemplar import EstadoEjemplar


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
