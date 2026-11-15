from typing import Any, Dict, List, Optional
from app.presentation.dto.solicitud_prestamo.request.ejemplar_ids import parse_ejemplar_ids


class CreateSolicitudLocalReq:
    def __init__(
        self,
        token: Optional[str] = None,
        socio_id: Optional[int] = None,
        ejemplar_id: Optional[int] = None,
        sede_origen_id: Optional[int] = None,
        ejemplar_ids: Optional[List[int]] = None,
    ) -> None:
        self.token = token
        self.socio_id = socio_id
        self.ejemplar_id = ejemplar_id
        self.sede_origen_id = sede_origen_id
        self.ejemplar_ids = ejemplar_ids

    @staticmethod
    def build(token: Optional[str], payload: Dict[str, Any]) -> "CreateSolicitudLocalReq":
        payload = payload or {}
        return CreateSolicitudLocalReq(
            token=token,
            socio_id=int(payload["socio_id"]) if payload.get("socio_id") is not None else None,
            ejemplar_id=int(payload["ejemplar_id"]) if payload.get("ejemplar_id") is not None else None,
            sede_origen_id=int(payload["sede_origen_id"]) if payload.get("sede_origen_id") is not None else None,
            ejemplar_ids=parse_ejemplar_ids(payload.get("ejemplar_ids")),
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_socio_id(self) -> Optional[int]:
        return self.socio_id

    def get_ejemplar_id(self) -> Optional[int]:
        return self.ejemplar_id

    def get_sede_origen_id(self) -> Optional[int]:
        return self.sede_origen_id

    def get_ejemplar_ids(self) -> Optional[List[int]]:
        return self.ejemplar_ids
