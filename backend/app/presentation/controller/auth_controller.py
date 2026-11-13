import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Depends, Header
from fastapi.responses import JSONResponse
from app.application.service.auth_service_i import AuthServiceI
from app.core.bean.dependencies import get_auth_service
from app.presentation.dto.auth.mapper.get_current_user_mapper import GetCurrentUserMapper
from app.presentation.dto.auth.mapper.login_mapper import LoginMapper
from app.presentation.dto.auth.request.get_current_user_req import GetCurrentUserReq
from app.presentation.dto.auth.request.login_req import LoginReq
from app.presentation.dto.auth.response.get_current_user_res import GetCurrentUserRes
from app.presentation.dto.auth.response.login_res import LoginRes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Auth"])


class AuthController:
    @staticmethod
    @router.post("/login", response_model=LoginRes)
    def login(
        payload: Dict[str, Any] = Body(...),
        service: AuthServiceI = Depends(get_auth_service),
    ) -> JSONResponse:
        logger.info("POST /auth/login called")

        request: LoginReq = LoginMapper.to_request(payload)
        response: LoginRes = service.login(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.get("/me", response_model=GetCurrentUserRes)
    def get_current_user(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: AuthServiceI = Depends(get_auth_service),
    ) -> JSONResponse:
        logger.info("GET /auth/me called")

        request: GetCurrentUserReq = GetCurrentUserMapper.to_request(token)
        response: GetCurrentUserRes = service.get_current_user(request)
        return JSONResponse(status_code=200, content=response.model_dump())
