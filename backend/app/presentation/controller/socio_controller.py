import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Depends, Header, Query
from fastapi.responses import JSONResponse
from app.application.service.socio_service_i import SocioServiceI
from app.core.bean.dependencies import get_socio_service
from app.domain.entity.estado_socio import EstadoSocio
from app.presentation.dto.socio.mapper import SocioMapper
from app.presentation.dto.socio.response import (
    GetAllSociosRes,
    GetSocioMultasRes,
    GetSocioPrestamosRes,
    SocioRes,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/socios", tags=["Socios"])


class SocioController:
    @staticmethod
    @router.get("", response_model=GetAllSociosRes)
    def get_all(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        q: Optional[str] = Query(default=None),
        documento: Optional[str] = Query(default=None),
        estado: Optional[EstadoSocio] = Query(default=None),
        service: SocioServiceI = Depends(get_socio_service),
    ) -> JSONResponse:
        logger.info("GET /socios called")
        request = SocioMapper.to_get_all_request(token, q, documento, estado)
        response = service.get_all(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.get("/{id}", response_model=SocioRes)
    def get_by_id(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: SocioServiceI = Depends(get_socio_service),
    ) -> JSONResponse:
        logger.info("GET /socios/%s called", id)
        request = SocioMapper.to_get_by_id_request(token, id)
        response = service.get_by_id(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.get("/{id}/prestamos", response_model=GetSocioPrestamosRes)
    def get_prestamos(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: SocioServiceI = Depends(get_socio_service),
    ) -> JSONResponse:
        logger.info("GET /socios/%s/prestamos called", id)
        request = SocioMapper.to_get_by_id_request(token, id)
        response = service.get_prestamos(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.get("/{id}/multas", response_model=GetSocioMultasRes)
    def get_multas(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: SocioServiceI = Depends(get_socio_service),
    ) -> JSONResponse:
        logger.info("GET /socios/%s/multas called", id)
        request = SocioMapper.to_get_by_id_request(token, id)
        response = service.get_multas(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.post("", response_model=SocioRes, status_code=201)
    def create(
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: SocioServiceI = Depends(get_socio_service),
    ) -> JSONResponse:
        logger.info("POST /socios called")
        request = SocioMapper.to_create_request(token, payload)
        response = service.create(request)
        return JSONResponse(status_code=201, content=response.model_dump())

    @staticmethod
    @router.put("/{id}", response_model=SocioRes)
    def update(
        id: int,
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: SocioServiceI = Depends(get_socio_service),
    ) -> JSONResponse:
        logger.info("PUT /socios/%s called", id)
        request = SocioMapper.to_update_request(token, id, payload)
        response = service.update(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.delete("/{id}", response_model=SocioRes)
    def delete(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: SocioServiceI = Depends(get_socio_service),
    ) -> JSONResponse:
        logger.info("DELETE /socios/%s called", id)
        request = SocioMapper.to_delete_request(token, id)
        response = service.delete(request)
        return JSONResponse(status_code=200, content=response.model_dump())
