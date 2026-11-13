from typing import Any, Dict, Optional
from app.domain.entity.estado_reserva import EstadoReserva


class UpdateReservaEstadoReq:
    def __init__(
        self,
        token: Optional[str] = None,
        id: Optional[int] = None,
        estado: Optional[EstadoReserva] = None,
    ) -> None:
        self.token = token
        self.id = id
        self.estado = estado

    @staticmethod
    def build(token: Optional[str], id: int, payload: Dict[str, Any]) -> "UpdateReservaEstadoReq":
        payload = payload or {}
        raw_estado = payload.get("estado")
        estado = (
            EstadoReserva(raw_estado)
            if raw_estado is not None and raw_estado in [e.value for e in EstadoReserva]
            else None
        )
        return UpdateReservaEstadoReq(token=token, id=id, estado=estado)

    def get_token(self) -> Optional[str]:
        return self.token

    def get_id(self) -> Optional[int]:
        return self.id

    def get_estado(self) -> Optional[EstadoReserva]:
        return self.estado
