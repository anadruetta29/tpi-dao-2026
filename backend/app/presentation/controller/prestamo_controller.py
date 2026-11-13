import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Depends, Header, Query
from fastapi.responses import JSONResponse
from app.application.service.prestamo_service_i import PrestamoServiceI
from app.core.bean.dependencies import get_prestamo_service
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.presentation.dto.prestamo.mapper import PrestamoMapper
from app.presentation.dto.prestamo.response import GetAllPrestamosRes, PrestamoRes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/prestamos", tags=["Préstamos"])


class PrestamoController:
    @staticmethod
    @router.get("", response_model=GetAllPrestamosRes)
    def get_all(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        socio_id: Optional[int] = Query(default=None),
        sede_id: Optional[int] = Query(default=None),
        estado: Optional[EstadoPrestamo] = Query(default=None),
        service: PrestamoServiceI = Depends(get_prestamo_service),
    ) -> JSONResponse:
        logger.info("GET /prestamos called")
        request = PrestamoMapper.to_get_all_request(token, socio_id, sede_id, estado)
        response = service.get_all(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.get("/{id}", response_model=PrestamoRes)
    def get_by_id(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: PrestamoServiceI = Depends(get_prestamo_service),
    ) -> JSONResponse:
        logger.info("GET /prestamos/%s called", id)
        request = PrestamoMapper.to_get_by_id_request(token, id)
        response = service.get_by_id(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.post("", response_model=PrestamoRes, status_code=201)
    def create(
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: PrestamoServiceI = Depends(get_prestamo_service),
    ) -> JSONResponse:
        logger.info("POST /prestamos called")
        request = PrestamoMapper.to_create_request(token, payload)
        response = service.create(request)
        return JSONResponse(status_code=201, content=response.model_dump(mode="json"))
