import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Depends, Header, Query
from fastapi.responses import JSONResponse
from app.application.service.sede_service_i import SedeServiceI
from app.core.bean.dependencies import get_sede_service
from app.domain.entity.estado_sede import EstadoSede
from app.presentation.dto.sede.mapper import SedeMapper
from app.presentation.dto.sede.response import GetAllSedesRes, SedeRes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sedes", tags=["Sedes"])


class SedeController:
    @staticmethod
    @router.get("", response_model=GetAllSedesRes)
    def get_all(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        estado: Optional[EstadoSede] = Query(default=None),
        service: SedeServiceI = Depends(get_sede_service),
    ) -> JSONResponse:
        logger.info("GET /sedes called")
        request = SedeMapper.to_get_all_request(token, estado)
        response = service.get_all(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.get("/{id}", response_model=SedeRes)
    def get_by_id(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: SedeServiceI = Depends(get_sede_service),
    ) -> JSONResponse:
        logger.info("GET /sedes/%s called", id)
        request = SedeMapper.to_get_by_id_request(token, id)
        response = service.get_by_id(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.post("", response_model=SedeRes, status_code=201)
    def create(
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: SedeServiceI = Depends(get_sede_service),
    ) -> JSONResponse:
        logger.info("POST /sedes called")
        request = SedeMapper.to_create_request(token, payload)
        response = service.create(request)
        return JSONResponse(status_code=201, content=response.model_dump())

    @staticmethod
    @router.put("/{id}", response_model=SedeRes)
    def update(
        id: int,
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: SedeServiceI = Depends(get_sede_service),
    ) -> JSONResponse:
        logger.info("PUT /sedes/%s called", id)
        request = SedeMapper.to_update_request(token, id, payload)
        response = service.update(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.delete("/{id}", response_model=SedeRes)
    def delete(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: SedeServiceI = Depends(get_sede_service),
    ) -> JSONResponse:
        logger.info("DELETE /sedes/%s called", id)
        request = SedeMapper.to_delete_request(token, id)
        response = service.delete(request)
        return JSONResponse(status_code=200, content=response.model_dump())
