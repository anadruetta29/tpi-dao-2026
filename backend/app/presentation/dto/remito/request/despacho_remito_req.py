from datetime import date
from typing import Any, Dict, Optional


class DespachoRemitoReq:
    def __init__(
        self,
        token: Optional[str] = None,
        id: Optional[int] = None,
        fechaDespacho: Optional[date] = None,
    ) -> None:
        self.token = token
        self.id = id
        self.fechaDespacho = fechaDespacho

    @staticmethod
    def build(
        token: Optional[str],
        id: int,
        payload: Optional[Dict[str, Any]] = None,
    ) -> "DespachoRemitoReq":
        payload = payload or {}
        raw_fecha = payload.get("fechaDespacho")
        return DespachoRemitoReq(
            token=token,
            id=id,
            fechaDespacho=date.fromisoformat(str(raw_fecha)) if raw_fecha else date.today(),
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_id(self) -> Optional[int]:
        return self.id

    def get_fecha_despacho(self) -> Optional[date]:
        return self.fechaDespacho
