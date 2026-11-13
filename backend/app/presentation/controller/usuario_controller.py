import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Depends, Header, Query
from fastapi.responses import JSONResponse
from app.application.service.usuario_service_i import UsuarioServiceI
from app.core.bean.dependencies import get_usuario_service
from app.domain.entity.rol import Rol
from app.presentation.dto.usuario.mapper import UsuarioMapper
from app.presentation.dto.usuario.response import GetAllUsuariosRes, UsuarioRes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


class UsuarioController:
    @staticmethod
    @router.get("", response_model=GetAllUsuariosRes)
    def get_all(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        role: Optional[Rol] = Query(default=None),
        activo: Optional[bool] = Query(default=None),
        service: UsuarioServiceI = Depends(get_usuario_service),
    ) -> JSONResponse:
        logger.info("GET /usuarios called")
        request = UsuarioMapper.to_get_all_request(token, role, activo)
        response = service.get_all(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.get("/{id}", response_model=UsuarioRes)
    def get_by_id(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: UsuarioServiceI = Depends(get_usuario_service),
    ) -> JSONResponse:
        logger.info("GET /usuarios/%s called", id)
        request = UsuarioMapper.to_get_by_id_request(token, id)
        response = service.get_by_id(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.post("", response_model=UsuarioRes, status_code=201)
    def create(
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: UsuarioServiceI = Depends(get_usuario_service),
    ) -> JSONResponse:
        logger.info("POST /usuarios called")
        request = UsuarioMapper.to_create_request(token, payload)
        response = service.create(request)
        return JSONResponse(status_code=201, content=response.model_dump())

    @staticmethod
    @router.put("/{id}", response_model=UsuarioRes)
    def update(
        id: int,
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: UsuarioServiceI = Depends(get_usuario_service),
    ) -> JSONResponse:
        logger.info("PUT /usuarios/%s called", id)
        request = UsuarioMapper.to_update_request(token, id, payload)
        response = service.update(request)
        return JSONResponse(status_code=200, content=response.model_dump())
