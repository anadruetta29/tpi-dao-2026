from typing import Optional
from app.domain.entity.estado_prestamo import EstadoPrestamo


class GetAllPrestamosReq:
    def __init__(
        self,
        token: Optional[str] = None,
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoPrestamo] = None,
    ) -> None:
        self.token = token
        self.socio_id = socio_id
        self.sede_id = sede_id
        self.estado = estado

    @staticmethod
    def build(
        token: Optional[str],
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoPrestamo] = None,
    ) -> "GetAllPrestamosReq":
        return GetAllPrestamosReq(token=token, socio_id=socio_id, sede_id=sede_id, estado=estado)

    def get_token(self) -> Optional[str]:
        return self.token

    def get_socio_id(self) -> Optional[int]:
        return self.socio_id

    def get_sede_id(self) -> Optional[int]:
        return self.sede_id

    def get_estado(self) -> Optional[EstadoPrestamo]:
        return self.estado
