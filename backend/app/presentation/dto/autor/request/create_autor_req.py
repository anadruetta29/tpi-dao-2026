from typing import Any, Dict, Optional


class CreateAutorReq:
    def __init__(
        self,
        token: Optional[str] = None,
        nombre: Optional[str] = None,
        apellido: Optional[str] = None,
    ) -> None:
        self.token = token
        self.nombre = nombre
        self.apellido = apellido

    @staticmethod
    def build(token: Optional[str], payload: Dict[str, Any]) -> "CreateAutorReq":
        payload = payload or {}
        return CreateAutorReq(
            token=token,
            nombre=str(payload["nombre"]).strip() if payload.get("nombre") is not None else None,
            apellido=str(payload["apellido"]).strip() if payload.get("apellido") is not None else None,
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_nombre(self) -> Optional[str]:
        return self.nombre

    def get_apellido(self) -> Optional[str]:
        return self.apellido
