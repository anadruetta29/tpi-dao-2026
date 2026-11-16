from typing import Optional
from app.domain.entity.estado_ejemplar import EstadoEjemplar


class RemitoIncidencia:
    def __init__(
        self,
        id: Optional[int] = None,
        remito_id: Optional[int] = None,
        ejemplar_id: Optional[int] = None,
        estado: Optional[EstadoEjemplar] = None,
        observacion: str = "",
    ) -> None:
        self.id = id
        self.remito_id = remito_id
        self.ejemplar_id = ejemplar_id
        self.estado = estado
        self.observacion = observacion
