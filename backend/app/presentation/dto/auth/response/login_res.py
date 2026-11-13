from typing import Optional
from pydantic import BaseModel
from app.domain.entity.rol import Rol
from app.domain.entity.usuario import Usuario


class AuthUserDTO(BaseModel):
    id: Optional[int] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[str] = None
    activo: Optional[bool] = None
    role: Optional[Rol] = None

    @staticmethod
    def from_domain(user: Usuario) -> "AuthUserDTO":
        return AuthUserDTO(
            id=user.id,
            nombre=user.nombre,
            apellido=user.apellido,
            email=user.email,
            activo=user.activo,
            role=user.role,
        )


class LoginRes(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user: AuthUserDTO

    @staticmethod
    def from_domain(token: str, user: Usuario) -> "LoginRes":
        return LoginRes(
            access_token=token,
            token_type="Bearer",
            user=AuthUserDTO.from_domain(user),
        )
