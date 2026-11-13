from typing import Optional
from app.domain.entity.usuario import Usuario
from app.presentation.dto.auth.request.get_current_user_req import GetCurrentUserReq
from app.presentation.dto.auth.response.get_current_user_res import GetCurrentUserRes


class GetCurrentUserMapper:
    @staticmethod
    def to_request(token: Optional[str]) -> GetCurrentUserReq:
        return GetCurrentUserReq.build(token)

    @staticmethod
    def to_response(user: Usuario) -> GetCurrentUserRes:
        return GetCurrentUserRes.from_domain(user)
