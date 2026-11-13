from datetime import date
from typing import Any, Dict, Optional


class CreateReservaReq:
    def __init__(
        self,
        token: Optional[str] = None,
        socio_id: Optional[int] = None,
        libro_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        ejemplar_id: Optional[int] = None,
        fecha: Optional[date] = None,
    ) -> None:
        self.token = token
        self.socio_id = socio_id
        self.libro_id = libro_id
        self.sede_id = sede_id
        self.ejemplar_id = ejemplar_id
        self.fecha = fecha

    @staticmethod
    def build(token: Optional[str], payload: Dict[str, Any]) -> "CreateReservaReq":
        payload = payload or {}
        raw_fecha = payload.get("fecha")
        return CreateReservaReq(
            token=token,
            socio_id=int(payload["socio_id"]) if payload.get("socio_id") is not None else None,
            libro_id=int(payload["libro_id"]) if payload.get("libro_id") is not None else None,
            sede_id=int(payload["sede_id"]) if payload.get("sede_id") is not None else None,
            ejemplar_id=int(payload["ejemplar_id"]) if payload.get("ejemplar_id") is not None else None,
            fecha=date.fromisoformat(str(raw_fecha)) if raw_fecha else date.today(),
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_socio_id(self) -> Optional[int]:
        return self.socio_id

    def get_libro_id(self) -> Optional[int]:
        return self.libro_id

    def get_sede_id(self) -> Optional[int]:
        return self.sede_id

    def get_ejemplar_id(self) -> Optional[int]:
        return self.ejemplar_id

    def get_fecha(self) -> Optional[date]:
        return self.fecha
