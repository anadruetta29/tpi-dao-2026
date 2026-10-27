from typing import Optional
from app.domain.entities.rol import Rol


class Usuario:
    def __init__(
        self,
        nombre: Optional[str] = None,
        apellido: Optional[str] = None,
        email: Optional[str] = None,
        password: Optional[str] = None,
        activo: Optional[bool] = None,
        role: Optional[Rol] = None,
    ) -> None:
        self.nombre = nombre
        self.apellido = apellido
        self.email = email
        self.password = password
        self.activo = activo
        self.role = role
