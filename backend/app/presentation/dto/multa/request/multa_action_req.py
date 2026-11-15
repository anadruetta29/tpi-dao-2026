from datetime import date
from typing import Any, Dict, Optional
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class MultaActionReq:
    def __init__(
        self,
        token: Optional[str] = None,
        id: Optional[int] = None,
        fechaPago: Optional[date] = None,
    ) -> None:
        self.token = token
        self.id = id
        self.fechaPago = fechaPago

    @staticmethod
    def build(
        token: Optional[str],
        id: int,
        payload: Optional[Dict[str, Any]] = None,
    ) -> "MultaActionReq":
        payload = payload or {}
        raw_fecha = payload.get("fechaPago")
        try:
            fecha_pago = date.fromisoformat(str(raw_fecha)) if raw_fecha else None
        except ValueError as exc:
            raise ErrorHandler(ErrorType.MULTA_FECHA_PAGO_INVALIDA) from exc
        return MultaActionReq(
            token=token,
            id=id,
            fechaPago=fecha_pago,
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_id(self) -> Optional[int]:
        return self.id

    def get_fecha_pago(self) -> Optional[date]:
        return self.fechaPago
