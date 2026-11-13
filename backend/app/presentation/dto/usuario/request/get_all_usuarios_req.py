from typing import Optional
from app.domain.entity.rol import Rol


class GetAllUsuariosReq:
    def __init__(
        self,
        token: Optional[str] = None,
        role: Optional[Rol] = None,
        activo: Optional[bool] = None,
    ) -> None:
        self.token = token
        self.role = role
        self.activo = activo

    @staticmethod
    def build(
        token: Optional[str],
        role: Optional[Rol] = None,
        activo: Optional[bool] = None,
    ) -> "GetAllUsuariosReq":
        return GetAllUsuariosReq(token=token, role=role, activo=activo)

    def get_token(self) -> Optional[str]:
        return self.token

    def get_role(self) -> Optional[Rol]:
        return self.role

    def get_activo(self) -> Optional[bool]:
        return self.activo
