from typing import Any, Dict, Optional


class CreateSedeReq:
    def __init__(
        self,
        token: Optional[str] = None,
        nombre: Optional[str] = None,
        telefono: Optional[str] = None,
        email: Optional[str] = None,
        horarioAtencion: Optional[str] = None,
    ) -> None:
        self.token = token
        self.nombre = nombre
        self.telefono = telefono
        self.email = email
        self.horarioAtencion = horarioAtencion

    @staticmethod
    def build(token: Optional[str], payload: Dict[str, Any]) -> "CreateSedeReq":
        payload = payload or {}
        return CreateSedeReq(
            token=token,
            nombre=str(payload["nombre"]).strip() if payload.get("nombre") is not None else None,
            telefono=str(payload["telefono"]).strip() if payload.get("telefono") is not None else None,
            email=str(payload["email"]).strip() if payload.get("email") is not None else None,
            horarioAtencion=(
                str(payload["horarioAtencion"]).strip()
                if payload.get("horarioAtencion") is not None
                else None
            ),
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_nombre(self) -> Optional[str]:
        return self.nombre

    def get_telefono(self) -> Optional[str]:
        return self.telefono

    def get_email(self) -> Optional[str]:
        return self.email

    def get_horario_atencion(self) -> Optional[str]:
        return self.horarioAtencion
