from typing import List, Optional
from pydantic import BaseModel
from app.domain.entity.rol import Rol
from app.domain.entity.usuario import Usuario


class UsuarioRes(BaseModel):
    id: Optional[int] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[str] = None
    activo: Optional[bool] = None
    role: Optional[Rol] = None

    @staticmethod
    def from_domain(usuario: Usuario) -> "UsuarioRes":
        return UsuarioRes(
            id=usuario.id,
            nombre=usuario.nombre,
            apellido=usuario.apellido,
            email=usuario.email,
            activo=usuario.activo,
            role=usuario.role,
        )


class GetAllUsuariosRes(BaseModel):
    usuarios: List[UsuarioRes]

    @staticmethod
    def from_domain_list(usuarios: List[Usuario]) -> "GetAllUsuariosRes":
        return GetAllUsuariosRes(usuarios=[UsuarioRes.from_domain(u) for u in usuarios])
