from typing import Any, Dict, Optional


class CreateSolicitudInterbibliotecariaReq:
    def __init__(
        self,
        token: Optional[str] = None,
        socio_id: Optional[int] = None,
        ejemplar_id: Optional[int] = None,
        sede_origen_id: Optional[int] = None,
        sede_destino_id: Optional[int] = None,
    ) -> None:
        self.token = token
        self.socio_id = socio_id
        self.ejemplar_id = ejemplar_id
        self.sede_origen_id = sede_origen_id
        self.sede_destino_id = sede_destino_id

    @staticmethod
    def build(token: Optional[str], payload: Dict[str, Any]) -> "CreateSolicitudInterbibliotecariaReq":
        payload = payload or {}
        return CreateSolicitudInterbibliotecariaReq(
            token=token,
            socio_id=int(payload["socio_id"]) if payload.get("socio_id") is not None else None,
            ejemplar_id=int(payload["ejemplar_id"]) if payload.get("ejemplar_id") is not None else None,
            sede_origen_id=int(payload["sede_origen_id"]) if payload.get("sede_origen_id") is not None else None,
            sede_destino_id=int(payload["sede_destino_id"]) if payload.get("sede_destino_id") is not None else None,
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_socio_id(self) -> Optional[int]:
        return self.socio_id

    def get_ejemplar_id(self) -> Optional[int]:
        return self.ejemplar_id

    def get_sede_origen_id(self) -> Optional[int]:
        return self.sede_origen_id

    def get_sede_destino_id(self) -> Optional[int]:
        return self.sede_destino_id
