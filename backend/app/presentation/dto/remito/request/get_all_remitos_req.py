from typing import Optional
from app.domain.entity.estado_envio import EstadoEnvio


class GetAllRemitosReq:
    def __init__(
        self,
        token: Optional[str] = None,
        sede_origen_id: Optional[int] = None,
        sede_destino_id: Optional[int] = None,
        estado: Optional[EstadoEnvio] = None,
    ) -> None:
        self.token = token
        self.sede_origen_id = sede_origen_id
        self.sede_destino_id = sede_destino_id
        self.estado = estado

    @staticmethod
    def build(
        token: Optional[str],
        sede_origen_id: Optional[int] = None,
        sede_destino_id: Optional[int] = None,
        estado: Optional[EstadoEnvio] = None,
    ) -> "GetAllRemitosReq":
        return GetAllRemitosReq(
            token=token,
            sede_origen_id=sede_origen_id,
            sede_destino_id=sede_destino_id,
            estado=estado,
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_sede_origen_id(self) -> Optional[int]:
        return self.sede_origen_id

    def get_sede_destino_id(self) -> Optional[int]:
        return self.sede_destino_id

    def get_estado(self) -> Optional[EstadoEnvio]:
        return self.estado
