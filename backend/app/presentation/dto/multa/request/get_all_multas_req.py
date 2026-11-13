from typing import Optional
from app.domain.entity.estado_multa import EstadoMulta


class GetAllMultasReq:
    def __init__(
        self,
        token: Optional[str] = None,
        socio_id: Optional[int] = None,
        estado: Optional[EstadoMulta] = None,
    ) -> None:
        self.token = token
        self.socio_id = socio_id
        self.estado = estado

    @staticmethod
    def build(
        token: Optional[str],
        socio_id: Optional[int] = None,
        estado: Optional[EstadoMulta] = None,
    ) -> "GetAllMultasReq":
        return GetAllMultasReq(token=token, socio_id=socio_id, estado=estado)

    def get_token(self) -> Optional[str]:
        return self.token

    def get_socio_id(self) -> Optional[int]:
        return self.socio_id

    def get_estado(self) -> Optional[EstadoMulta]:
        return self.estado
