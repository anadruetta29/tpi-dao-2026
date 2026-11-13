from typing import Optional
from app.domain.entity.estado_sede import EstadoSede


class GetAllSedesReq:
    def __init__(self, token: Optional[str] = None, estado: Optional[EstadoSede] = None) -> None:
        self.token = token
        self.estado = estado

    @staticmethod
    def build(token: Optional[str], estado: Optional[EstadoSede] = None) -> "GetAllSedesReq":
        return GetAllSedesReq(token=token, estado=estado)

    def get_token(self) -> Optional[str]:
        return self.token

    def get_estado(self) -> Optional[EstadoSede]:
        return self.estado
