from typing import Any, Dict
from app.domain.entity.usuario import Usuario
from app.presentation.dto.auth.request.login_req import LoginReq
from app.presentation.dto.auth.response.login_res import LoginRes


class LoginMapper:
    @staticmethod
    def to_request(payload: Dict[str, Any]) -> LoginReq:
        return LoginReq.build(payload)

    @staticmethod
    def to_response(token: str, user: Usuario) -> LoginRes:
        return LoginRes.from_domain(token, user)
