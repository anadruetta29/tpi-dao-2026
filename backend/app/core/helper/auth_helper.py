from typing import Any, Dict, Optional
from app.core.helper.jwt_helper import JwtHelper
from app.domain.entity.rol import Rol
from app.domain.entity.usuario import Usuario
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class AuthHelper:
    @staticmethod
    def authenticate(
        token: Optional[str],
        usuario_repository: UsuarioRepositoryI,
        *allowed_roles: Rol,
    ) -> Usuario:
        if token is None or not token.strip():
            raise ErrorHandler(ErrorType.UNAUTHORIZED)

        payload: Dict[str, Any] = JwtHelper.verify_token(token)
        user: Optional[Usuario] = None
        user_id = payload.get("user_id")
        email = payload.get("email")

        if user_id is not None:
            user = usuario_repository.get_by_id(int(user_id))
        if user is None and email is not None:
            user = usuario_repository.get_by_email(str(email).strip())

        if user is None:
            raise ErrorHandler(ErrorType.UNAUTHORIZED)
        if user.activo is False:
            raise ErrorHandler(ErrorType.USER_INACTIVE)

        if allowed_roles:
            user.validate_role(*allowed_roles)

        return user
