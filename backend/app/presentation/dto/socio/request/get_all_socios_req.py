from typing import Optional
from app.domain.entity.estado_socio import EstadoSocio


class GetAllSociosReq:
    def __init__(
        self,
        token: Optional[str] = None,
        q: Optional[str] = None,
        documento: Optional[str] = None,
        estado: Optional[EstadoSocio] = None,
    ) -> None:
        self.token = token
        self.q = q
        self.documento = documento
        self.estado = estado

    @staticmethod
    def build(
        token: Optional[str],
        q: Optional[str] = None,
        documento: Optional[str] = None,
        estado: Optional[EstadoSocio] = None,
    ) -> "GetAllSociosReq":
        return GetAllSociosReq(token=token, q=q, documento=documento, estado=estado)

    def get_token(self) -> Optional[str]:
        return self.token

    def get_q(self) -> Optional[str]:
        return self.q

    def get_documento(self) -> Optional[str]:
        return self.documento

    def get_estado(self) -> Optional[EstadoSocio]:
        return self.estado
