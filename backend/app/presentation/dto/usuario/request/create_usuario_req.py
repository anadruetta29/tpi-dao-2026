from typing import Any, Dict, Optional
from app.domain.entity.rol import Rol


class CreateUsuarioReq:
    def __init__(
        self,
        token: Optional[str] = None,
        nombre: Optional[str] = None,
        apellido: Optional[str] = None,
        email: Optional[str] = None,
        password: Optional[str] = None,
        role: Optional[Rol] = None,
        sede_id: Optional[int] = None,
    ) -> None:
        self.token = token
        self.nombre = nombre
        self.apellido = apellido
        self.email = email
        self.password = password
        self.role = role
        self.sede_id = sede_id

    @staticmethod
    def build(token: Optional[str], payload: Dict[str, Any]) -> "CreateUsuarioReq":
        payload = payload or {}
        raw_role = payload.get("role")
        role = Rol(raw_role) if raw_role is not None and raw_role in [r.value for r in Rol] else None
        raw_sede = payload.get("sede_id")
        sede_id = int(raw_sede) if raw_sede is not None and str(raw_sede).strip() != "" else None
        return CreateUsuarioReq(
            token=token,
            nombre=str(payload["nombre"]).strip() if payload.get("nombre") is not None else None,
            apellido=str(payload["apellido"]).strip() if payload.get("apellido") is not None else None,
            email=str(payload["email"]).strip() if payload.get("email") is not None else None,
            password=str(payload["password"]) if payload.get("password") is not None else None,
            role=role,
            sede_id=sede_id,
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_nombre(self) -> Optional[str]:
        return self.nombre

    def get_apellido(self) -> Optional[str]:
        return self.apellido

    def get_email(self) -> Optional[str]:
        return self.email

    def get_password(self) -> Optional[str]:
        return self.password

    def get_role(self) -> Optional[Rol]:
        return self.role

    def get_sede_id(self) -> Optional[int]:
        return self.sede_id
