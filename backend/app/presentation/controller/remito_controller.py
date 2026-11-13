import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Depends, Header, Query
from fastapi.responses import JSONResponse
from app.application.service.remito_service_i import RemitoServiceI
from app.core.bean.dependencies import get_remito_service
from app.domain.entity.estado_envio import EstadoEnvio
from app.presentation.dto.remito.mapper import RemitoMapper
from app.presentation.dto.remito.response import (
    GetAllRemitosRes,
    GetRemitoTrazabilidadRes,
    RemitoRes,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/remitos", tags=["Remitos"])


class RemitoController:
    @staticmethod
    @router.get("", response_model=GetAllRemitosRes)
    def get_all(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        sede_origen_id: Optional[int] = Query(default=None),
        sede_destino_id: Optional[int] = Query(default=None),
        estado: Optional[EstadoEnvio] = Query(default=None),
        service: RemitoServiceI = Depends(get_remito_service),
    ) -> JSONResponse:
        logger.info("GET /remitos called")
        request = RemitoMapper.to_get_all_request(token, sede_origen_id, sede_destino_id, estado)
        response = service.get_all(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.get("/{id}", response_model=RemitoRes)
    def get_by_id(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: RemitoServiceI = Depends(get_remito_service),
    ) -> JSONResponse:
        logger.info("GET /remitos/%s called", id)
        request = RemitoMapper.to_get_by_id_request(token, id)
        response = service.get_by_id(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.post("", response_model=RemitoRes, status_code=201)
    def create(
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: RemitoServiceI = Depends(get_remito_service),
    ) -> JSONResponse:
        logger.info("POST /remitos called")
        request = RemitoMapper.to_create_request(token, payload)
        response = service.create(request)
        return JSONResponse(status_code=201, content=response.model_dump(mode="json"))

    @staticmethod
    @router.patch("/{id}/despacho", response_model=RemitoRes)
    def despachar(
        id: int,
        payload: Optional[Dict[str, Any]] = Body(default=None),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: RemitoServiceI = Depends(get_remito_service),
    ) -> JSONResponse:
        logger.info("PATCH /remitos/%s/despacho called", id)
        request = RemitoMapper.to_despacho_request(token, id, payload)
        response = service.despachar(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.patch("/{id}/recepcion", response_model=RemitoRes)
    def recibir(
        id: int,
        payload: Optional[Dict[str, Any]] = Body(default=None),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: RemitoServiceI = Depends(get_remito_service),
    ) -> JSONResponse:
        logger.info("PATCH /remitos/%s/recepcion called", id)
        request = RemitoMapper.to_recepcion_request(token, id, payload)
        response = service.recibir(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.get("/{id}/trazabilidad", response_model=GetRemitoTrazabilidadRes)
    def get_trazabilidad(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: RemitoServiceI = Depends(get_remito_service),
    ) -> JSONResponse:
        logger.info("GET /remitos/%s/trazabilidad called", id)
        request = RemitoMapper.to_get_by_id_request(token, id)
        response = service.get_trazabilidad(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))
