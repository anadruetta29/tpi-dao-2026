import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Depends, Header
from fastapi.responses import JSONResponse
from app.application.service.devolucion_service_i import DevolucionServiceI
from app.core.bean.dependencies import get_devolucion_service
from app.presentation.dto.devolucion.mapper import DevolucionMapper
from app.presentation.dto.devolucion.response import DevolucionRes, GetAllDevolucionesRes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/devoluciones", tags=["Devoluciones"])


class DevolucionController:
    @staticmethod
    @router.get("", response_model=GetAllDevolucionesRes)
    def get_all(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: DevolucionServiceI = Depends(get_devolucion_service),
    ) -> JSONResponse:
        logger.info("GET /devoluciones called")
        request = DevolucionMapper.to_get_all_request(token)
        response = service.get_all(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.get("/{id}", response_model=DevolucionRes)
    def get_by_id(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: DevolucionServiceI = Depends(get_devolucion_service),
    ) -> JSONResponse:
        logger.info("GET /devoluciones/%s called", id)
        request = DevolucionMapper.to_get_by_id_request(token, id)
        response = service.get_by_id(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.post("", response_model=DevolucionRes, status_code=201)
    def create(
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: DevolucionServiceI = Depends(get_devolucion_service),
    ) -> JSONResponse:
        logger.info("POST /devoluciones called")
        request = DevolucionMapper.to_create_request(token, payload)
        response = service.create(request)
        return JSONResponse(status_code=201, content=response.model_dump(mode="json"))
