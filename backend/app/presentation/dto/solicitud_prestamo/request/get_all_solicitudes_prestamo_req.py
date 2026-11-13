from typing import Optional
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.tipo_prestamo import TipoPrestamo


class GetAllSolicitudesPrestamoReq:
    def __init__(
        self,
        token: Optional[str] = None,
        tipo: Optional[TipoPrestamo] = None,
        estado: Optional[EstadoSolicitud] = None,
        sede_id: Optional[int] = None,
    ) -> None:
        self.token = token
        self.tipo = tipo
        self.estado = estado
        self.sede_id = sede_id

    @staticmethod
    def build(
        token: Optional[str],
        tipo: Optional[TipoPrestamo] = None,
        estado: Optional[EstadoSolicitud] = None,
        sede_id: Optional[int] = None,
    ) -> "GetAllSolicitudesPrestamoReq":
        return GetAllSolicitudesPrestamoReq(token=token, tipo=tipo, estado=estado, sede_id=sede_id)

    def get_token(self) -> Optional[str]:
        return self.token

    def get_tipo(self) -> Optional[TipoPrestamo]:
        return self.tipo

    def get_estado(self) -> Optional[EstadoSolicitud]:
        return self.estado

    def get_sede_id(self) -> Optional[int]:
        return self.sede_id
