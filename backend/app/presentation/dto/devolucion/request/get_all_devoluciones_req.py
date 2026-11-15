from typing import Optional
from app.domain.entity.estado_ejemplar import EstadoEjemplar


class GetAllDevolucionesReq:
    def __init__(
        self,
        token: Optional[str] = None,
        prestamo_id: Optional[int] = None,
        estado_devuelto: Optional[EstadoEjemplar] = None,
    ) -> None:
        self.token = token
        self.prestamo_id = prestamo_id
        self.estado_devuelto = estado_devuelto

    @staticmethod
    def build(
        token: Optional[str],
        prestamo_id: Optional[int] = None,
        estado_devuelto: Optional[EstadoEjemplar] = None,
    ) -> "GetAllDevolucionesReq":
        return GetAllDevolucionesReq(
            token=token,
            prestamo_id=prestamo_id,
            estado_devuelto=estado_devuelto,
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_prestamo_id(self) -> Optional[int]:
        return self.prestamo_id

    def get_estado_devuelto(self) -> Optional[EstadoEjemplar]:
        return self.estado_devuelto
