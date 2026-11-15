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
        sede_id: Optional[int] = None,
    ) -> None:
        self.id = id
        self.nombre = nombre
        self.apellido = apellido
        self.email = email
        self.password = password
        self.activo = activo
        self.role = role
        self.sede_id = sede_id

    def validate_role(self, *allowed_roles: Rol) -> None:
        if self.role is None or self.role not in allowed_roles:
            raise ErrorHandler(ErrorType.FORBIDDEN)

    def resolve_sede_filter(self, requested_sede_id: Optional[int]) -> Optional[int]:
        if self.role != Rol.RECEPCIONISTA:
            return requested_sede_id
        if self.sede_id is None:
            raise ErrorHandler(ErrorType.FORBIDDEN)
        return self.sede_id

    def validate_sede_access(self, *sede_ids: Optional[int]) -> None:
        if self.role != Rol.RECEPCIONISTA:
            return
        if self.sede_id is None or self.sede_id not in sede_ids:
            raise ErrorHandler(ErrorType.FORBIDDEN)
