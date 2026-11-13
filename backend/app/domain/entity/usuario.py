from typing import Optional
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class Usuario:
    def __init__(
        self,
        id: Optional[int] = None,
        nombre: Optional[str] = None,
        apellido: Optional[str] = None,
        email: Optional[str] = None,
        password: Optional[str] = None,
        activo: Optional[bool] = True,
        role: Optional[Rol] = None,
    ) -> None:
        self.id = id
        self.nombre = nombre
        self.apellido = apellido
        self.email = email
        self.password = password
        self.activo = activo
        self.role = role

    def validate_role(self, *allowed_roles: Rol) -> None:
        if self.role is None or self.role not in allowed_roles:
            raise ErrorHandler(ErrorType.FORBIDDEN)
