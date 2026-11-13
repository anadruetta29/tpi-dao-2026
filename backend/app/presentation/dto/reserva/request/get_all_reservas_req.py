from typing import Optional
from app.domain.entity.estado_reserva import EstadoReserva


class GetAllReservasReq:
    def __init__(
        self,
        token: Optional[str] = None,
        libro_id: Optional[int] = None,
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoReserva] = None,
    ) -> None:
        self.token = token
        self.libro_id = libro_id
        self.socio_id = socio_id
        self.sede_id = sede_id
        self.estado = estado

    @staticmethod
    def build(
        token: Optional[str],
        libro_id: Optional[int] = None,
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoReserva] = None,
    ) -> "GetAllReservasReq":
        return GetAllReservasReq(
            token=token,
            libro_id=libro_id,
            socio_id=socio_id,
            sede_id=sede_id,
            estado=estado,
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_libro_id(self) -> Optional[int]:
        return self.libro_id

    def get_socio_id(self) -> Optional[int]:
        return self.socio_id

    def get_sede_id(self) -> Optional[int]:
        return self.sede_id

    def get_estado(self) -> Optional[EstadoReserva]:
        return self.estado
