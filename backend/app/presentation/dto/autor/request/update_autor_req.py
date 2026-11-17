from typing import Any, Dict, Optional


class UpdateAutorReq:
    def __init__(
        self,
        token: Optional[str] = None,
        id: Optional[int] = None,
        nombre: Optional[str] = None,
        apellido: Optional[str] = None,
    ) -> None:
        self.token = token
        self.id = id
        self.nombre = nombre
        self.apellido = apellido

    @staticmethod
    def build(
        token: Optional[str],
        id: int,
        payload: Optional[Dict[str, Any]] = None,
    ) -> "UpdateAutorReq":
        payload = payload or {}
        return UpdateAutorReq(
            token=token,
            id=id,
            nombre=payload.get("nombre"),
            apellido=payload.get("apellido"),
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_id(self) -> Optional[int]:
        return self.id

    def get_nombre(self) -> Optional[str]:
        return self.nombre

    def get_apellido(self) -> Optional[str]:
        return self.apellido
