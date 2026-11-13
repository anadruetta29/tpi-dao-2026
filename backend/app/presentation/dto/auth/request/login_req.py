from typing import Any, Dict, Optional


class LoginReq:
    def __init__(self, email: Optional[str] = None, password: Optional[str] = None) -> None:
        self.email = email
        self.password = password

    @staticmethod
    def build(payload: Dict[str, Any]) -> "LoginReq":
        payload = payload or {}
        email = payload.get("email")
        password = payload.get("password")
        return LoginReq(
            email=str(email).strip() if email is not None else None,
            password=str(password) if password is not None else None,
        )

    def get_email(self) -> Optional[str]:
        return self.email

    def get_password(self) -> Optional[str]:
        return self.password
