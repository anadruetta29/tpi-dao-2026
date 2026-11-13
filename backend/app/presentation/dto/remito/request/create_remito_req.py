from datetime import date
from typing import Any, Dict, List, Optional


class CreateRemitoReq:
    def __init__(
        self,
        token: Optional[str] = None,
        sede_origen_id: Optional[int] = None,
        sede_destino_id: Optional[int] = None,
        ejemplar_ids: Optional[List[int]] = None,
        fechaEmision: Optional[date] = None,
    ) -> None:
        self.token = token
        self.sede_origen_id = sede_origen_id
        self.sede_destino_id = sede_destino_id
        self.ejemplar_ids = ejemplar_ids if ejemplar_ids is not None else []
        self.fechaEmision = fechaEmision

    @staticmethod
    def build(token: Optional[str], payload: Dict[str, Any]) -> "CreateRemitoReq":
        payload = payload or {}
        raw_ej = payload.get("ejemplar_ids")
        raw_fecha = payload.get("fechaEmision")
        return CreateRemitoReq(
            token=token,
            sede_origen_id=(
                int(payload["sede_origen_id"]) if payload.get("sede_origen_id") is not None else None
            ),
            sede_destino_id=(
                int(payload["sede_destino_id"]) if payload.get("sede_destino_id") is not None else None
            ),
            ejemplar_ids=[int(e) for e in raw_ej] if isinstance(raw_ej, list) else [],
            fechaEmision=date.fromisoformat(str(raw_fecha)) if raw_fecha else date.today(),
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_sede_origen_id(self) -> Optional[int]:
        return self.sede_origen_id

    def get_sede_destino_id(self) -> Optional[int]:
        return self.sede_destino_id

    def get_ejemplar_ids(self) -> List[int]:
        return self.ejemplar_ids

    def get_fecha_emision(self) -> Optional[date]:
        return self.fechaEmision
