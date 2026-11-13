from app.application.service.auth_service_i import AuthServiceI
from app.application.use_case.auth.login_use_case import LoginUseCase
from app.application.use_case.auth.get_current_user_use_case import GetCurrentUserUseCase
from app.presentation.dto.auth.mapper.login_mapper import LoginMapper
from app.presentation.dto.auth.mapper.get_current_user_mapper import GetCurrentUserMapper
from app.presentation.dto.auth.request.login_req import LoginReq
from app.presentation.dto.auth.request.get_current_user_req import GetCurrentUserReq
from app.presentation.dto.auth.response.login_res import LoginRes
from app.presentation.dto.auth.response.get_current_user_res import GetCurrentUserRes


class AuthService(AuthServiceI):
    def __init__(
        self,
        login_use_case: LoginUseCase,
        get_current_user_use_case: GetCurrentUserUseCase,
    ) -> None:
        self.login_use_case = login_use_case
        self.get_current_user_use_case = get_current_user_use_case

    def login(self, dto: LoginReq) -> LoginRes:
        result: LoginUseCase.Result = self.login_use_case.execute(
            LoginUseCase.Command(
                email=dto.get_email(),
                password=dto.get_password(),
            )
        )
        return LoginMapper.to_response(result.token, result.user)

    def get_current_user(self, dto: GetCurrentUserReq) -> GetCurrentUserRes:
        result: GetCurrentUserUseCase.Result = self.get_current_user_use_case.execute(
            GetCurrentUserUseCase.Command(
                token=dto.get_token(),
            )
        )
        return GetCurrentUserMapper.to_response(result.user)
