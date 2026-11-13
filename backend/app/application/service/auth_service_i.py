from abc import ABC, abstractmethod
from app.presentation.dto.auth.request.login_req import LoginReq
from app.presentation.dto.auth.request.get_current_user_req import GetCurrentUserReq
from app.presentation.dto.auth.response.login_res import LoginRes
from app.presentation.dto.auth.response.get_current_user_res import GetCurrentUserRes


class AuthServiceI(ABC):
    @abstractmethod
    def login(self, dto: LoginReq) -> LoginRes:
        pass

    @abstractmethod
    def get_current_user(self, dto: GetCurrentUserReq) -> GetCurrentUserRes:
        pass
