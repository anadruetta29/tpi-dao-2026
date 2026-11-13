from typing import Optional
from pydantic import BaseModel
from app.domain.entity.rol import Rol
from app.domain.entity.usuario import Usuario


class GetCurrentUserRes(BaseModel):
    id: Optional[int] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[str] = None
    activo: Optional[bool] = None
    role: Optional[Rol] = None

    @staticmethod
    def from_domain(user: Usuario) -> "GetCurrentUserRes":
        return GetCurrentUserRes(
            id=user.id,
            nombre=user.nombre,
            apellido=user.apellido,
            email=user.email,
            activo=user.activo,
            role=user.role,
        )
