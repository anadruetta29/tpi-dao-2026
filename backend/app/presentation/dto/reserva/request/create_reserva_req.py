from typing import Any, Dict, Optional


class CreateReservaReq:
    def __init__(
        self,
        token: Optional[str] = None,
        socio_id: Optional[int] = None,
        libro_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        ejemplar_id: Optional[int] = None,
    ) -> None:
        self.token = token
        self.socio_id = socio_id
        self.libro_id = libro_id
        self.sede_id = sede_id
        self.ejemplar_id = ejemplar_id

    @staticmethod
    def build(token: Optional[str], payload: Dict[str, Any]) -> "CreateReservaReq":
        payload = payload or {}
        return CreateReservaReq(
            token=token,
            socio_id=int(payload["socio_id"]) if payload.get("socio_id") is not None else None,
            libro_id=int(payload["libro_id"]) if payload.get("libro_id") is not None else None,
            sede_id=int(payload["sede_id"]) if payload.get("sede_id") is not None else None,
            ejemplar_id=int(payload["ejemplar_id"]) if payload.get("ejemplar_id") is not None else None,
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
