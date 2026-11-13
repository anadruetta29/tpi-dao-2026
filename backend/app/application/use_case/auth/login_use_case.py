import logging
from dataclasses import dataclass
from typing import Optional
from app.core.helper.jwt_helper import JwtHelper
from app.core.helper.password_helper import PasswordHelper
from app.domain.entity.usuario import Usuario
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI

logger = logging.getLogger(__name__)


class LoginUseCase:
    def __init__(self, usuario_repository: UsuarioRepositoryI) -> None:
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        email: Optional[str]
        password: Optional[str]

    @dataclass(frozen=True)
    class Result:
        token: str
        user: Usuario

    def execute(self, command: Command) -> Result:
        # 1. Validate input
        if (
            command.email is None
            or not command.email.strip()
            or command.password is None
            or not command.password.strip()
        ):
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        # 2. Find user by email
        user: Optional[Usuario] = self.usuario_repository.get_by_email(command.email.strip())
        if user is None:
            raise ErrorHandler(ErrorType.INVALID_CREDENTIALS)

        # 3. Validate password
        if not PasswordHelper.verify(command.password, user.password):
            raise ErrorHandler(ErrorType.INVALID_CREDENTIALS)

        # 4. Validate user status
        if user.activo is False:
            raise ErrorHandler(ErrorType.USER_INACTIVE)

        # 5. Generate JWT token
        token: str = JwtHelper.create_token(user)
        logger.info("LoginUseCase: authenticated user %s (role=%s)", user.email, user.role)

        # 6. End of Use Case
        return LoginUseCase.Result(
            token=token,
            user=user,
        )
