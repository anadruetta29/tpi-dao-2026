import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Depends, Header
from fastapi.responses import JSONResponse
from app.application.service.autor_service_i import AutorServiceI
from app.core.bean.dependencies import get_autor_service
from app.presentation.dto.autor.mapper import AutorMapper
from app.presentation.dto.autor.response import AutorRes, GetAllAutoresRes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/autores", tags=["Autores"])


class AutorController:
    @staticmethod
    @router.get("", response_model=GetAllAutoresRes)
    def get_all(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: AutorServiceI = Depends(get_autor_service),
    ) -> JSONResponse:
        logger.info("GET /autores called")
        request = AutorMapper.to_get_all_request(token)
        response = service.get_all(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.post("", response_model=AutorRes, status_code=201)
    def create(
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: AutorServiceI = Depends(get_autor_service),
    ) -> JSONResponse:
        logger.info("POST /autores called")
        request = AutorMapper.to_create_request(token, payload)
        response = service.create(request)
        return JSONResponse(status_code=201, content=response.model_dump())
