from typing import Any, Dict, Optional
from app.domain.entity.estado_solicitud import EstadoSolicitud


class UpdateSolicitudEstadoReq:
    def __init__(
        self,
        token: Optional[str] = None,
        id: Optional[int] = None,
        estado: Optional[EstadoSolicitud] = None,
    ) -> None:
        self.token = token
        self.id = id
        self.estado = estado

    @staticmethod
    def build(token: Optional[str], id: int, payload: Dict[str, Any]) -> "UpdateSolicitudEstadoReq":
        payload = payload or {}
        raw_estado = payload.get("estado")
        estado = (
            EstadoSolicitud(raw_estado)
            if raw_estado is not None and raw_estado in [e.value for e in EstadoSolicitud]
            else None
        )
        return UpdateSolicitudEstadoReq(token=token, id=id, estado=estado)

    def get_token(self) -> Optional[str]:
        return self.token

    def get_id(self) -> Optional[int]:
        return self.id

    def get_estado(self) -> Optional[EstadoSolicitud]:
        return self.estado
