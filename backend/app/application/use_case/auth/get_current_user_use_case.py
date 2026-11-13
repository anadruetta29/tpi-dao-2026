import logging
from dataclasses import dataclass
from typing import Any, Dict, Optional
from app.core.helper.jwt_helper import JwtHelper
from app.domain.entity.usuario import Usuario
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI

logger = logging.getLogger(__name__)


class GetCurrentUserUseCase:
    def __init__(self, usuario_repository: UsuarioRepositoryI) -> None:
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]

    @dataclass(frozen=True)
    class Result:
        user: Usuario

    def execute(self, command: Command) -> Result:
        # 1. Validate token presence
        if command.token is None or not command.token.strip():
            raise ErrorHandler(ErrorType.UNAUTHORIZED)

        # 2. Verify and decode token
        payload: Dict[str, Any] = JwtHelper.verify_token(command.token)

        # 3. Find user by ID or email from token claims
        user: Optional[Usuario] = None
        user_id = payload.get("user_id")
        email = payload.get("email")

        if user_id is not None:
            user = self.usuario_repository.get_by_id(int(user_id))
        if user is None and email is not None:
            user = self.usuario_repository.get_by_email(str(email).strip())

        if user is None:
            raise ErrorHandler(ErrorType.UNAUTHORIZED)

        # 4. Validate user is active
        if user.activo is False:
            raise ErrorHandler(ErrorType.USER_INACTIVE)

        logger.info("GetCurrentUserUseCase: resolved user %s (role=%s)", user.email, user.role)

        # 5. End of Use Case
        return GetCurrentUserUseCase.Result(
            user=user,
        )
