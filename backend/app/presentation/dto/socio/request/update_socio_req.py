from typing import Any, Dict, Optional


class UpdateSocioReq:
    def __init__(
        self,
        token: Optional[str] = None,
        id: Optional[int] = None,
        nombre: Optional[str] = None,
        apellido: Optional[str] = None,
        documento: Optional[str] = None,
        email: Optional[str] = None,
        telefono: Optional[str] = None,
    ) -> None:
        self.token = token
        self.id = id
        self.nombre = nombre
        self.apellido = apellido
        self.documento = documento
        self.email = email
        self.telefono = telefono

    @staticmethod
    def build(token: Optional[str], id: int, payload: Dict[str, Any]) -> "UpdateSocioReq":
        payload = payload or {}
        return UpdateSocioReq(
            token=token,
            id=id,
            nombre=str(payload["nombre"]).strip() if payload.get("nombre") is not None else None,
            apellido=str(payload["apellido"]).strip() if payload.get("apellido") is not None else None,
            documento=str(payload["documento"]).strip() if payload.get("documento") is not None else None,
            email=str(payload["email"]).strip() if payload.get("email") is not None else None,
            telefono=str(payload["telefono"]).strip() if payload.get("telefono") is not None else None,
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_id(self) -> Optional[int]:
        return self.id

    def get_nombre(self) -> Optional[str]:
        return self.nombre

    def get_apellido(self) -> Optional[str]:
        return self.apellido

    def get_documento(self) -> Optional[str]:
        return self.documento

    def get_email(self) -> Optional[str]:
        return self.email

    def get_telefono(self) -> Optional[str]:
        return self.telefono
