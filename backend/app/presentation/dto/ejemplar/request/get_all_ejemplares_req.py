from typing import Optional
from app.domain.entity.estado_ejemplar import EstadoEjemplar


class GetAllEjemplaresReq:
    def __init__(
        self,
        token: Optional[str] = None,
        libro_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoEjemplar] = None,
    ) -> None:
        self.token = token
        self.libro_id = libro_id
        self.sede_id = sede_id
        self.estado = estado

    @staticmethod
    def build(
        token: Optional[str],
        libro_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoEjemplar] = None,
    ) -> "GetAllEjemplaresReq":
        return GetAllEjemplaresReq(token=token, libro_id=libro_id, sede_id=sede_id, estado=estado)

    def get_token(self) -> Optional[str]:
        return self.token

    def get_libro_id(self) -> Optional[int]:
        return self.libro_id

    def get_sede_id(self) -> Optional[int]:
        return self.sede_id

    def get_estado(self) -> Optional[EstadoEjemplar]:
        return self.estado
