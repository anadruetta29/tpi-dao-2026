from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import jwt
from app.core.config.settings import settings
from app.domain.entity.usuario import Usuario
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class JwtHelper:
    @staticmethod
    def create_token(user: Usuario) -> str:
        now = datetime.now(timezone.utc)
        expire = now + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
        payload: Dict[str, Any] = {
            "sub": str(user.id) if user.id is not None else user.email,
            "user_id": user.id,
            "email": user.email,
            "role": user.role.value if user.role is not None else None,
            "iat": now,
            "exp": expire,
        }
        return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def extract_bearer_token(authorization_header: Optional[str]) -> str:
        if not authorization_header or not authorization_header.strip():
            raise ErrorHandler(ErrorType.UNAUTHORIZED)
        raw = authorization_header.strip()
        if raw.lower().startswith("bearer "):
            token = raw[7:].strip()
        else:
            token = raw
        if not token:
            raise ErrorHandler(ErrorType.UNAUTHORIZED)
        return token

    @staticmethod
    def verify_token(authorization_header: Optional[str]) -> Dict[str, Any]:
        token = JwtHelper.extract_bearer_token(authorization_header)
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM],
            )
            return payload
        except jwt.PyJWTError:
            raise ErrorHandler(ErrorType.UNAUTHORIZED)
