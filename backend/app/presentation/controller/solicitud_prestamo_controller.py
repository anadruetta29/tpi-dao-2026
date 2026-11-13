import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Depends, Header, Query
from fastapi.responses import JSONResponse
from app.application.service.solicitud_prestamo_service_i import SolicitudPrestamoServiceI
from app.core.bean.dependencies import get_solicitud_prestamo_service
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.presentation.dto.solicitud_prestamo.mapper import SolicitudPrestamoMapper
from app.presentation.dto.solicitud_prestamo.response import (
    GetAllSolicitudesPrestamoRes,
    SolicitudPrestamoRes,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/solicitudes-prestamo", tags=["Solicitudes de Préstamo"])


class SolicitudPrestamoController:
    @staticmethod
    @router.get("", response_model=GetAllSolicitudesPrestamoRes)
    def get_all(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        tipo: Optional[TipoPrestamo] = Query(default=None),
        estado: Optional[EstadoSolicitud] = Query(default=None),
        sede_id: Optional[int] = Query(default=None),
        service: SolicitudPrestamoServiceI = Depends(get_solicitud_prestamo_service),
    ) -> JSONResponse:
        logger.info("GET /solicitudes-prestamo called")
        request = SolicitudPrestamoMapper.to_get_all_request(token, tipo, estado, sede_id)
        response = service.get_all(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.get("/{id}", response_model=SolicitudPrestamoRes)
    def get_by_id(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: SolicitudPrestamoServiceI = Depends(get_solicitud_prestamo_service),
    ) -> JSONResponse:
        logger.info("GET /solicitudes-prestamo/%s called", id)
        request = SolicitudPrestamoMapper.to_get_by_id_request(token, id)
        response = service.get_by_id(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.post("/local", response_model=SolicitudPrestamoRes, status_code=201)
    def create_local(
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: SolicitudPrestamoServiceI = Depends(get_solicitud_prestamo_service),
    ) -> JSONResponse:
        logger.info("POST /solicitudes-prestamo/local called")
        request = SolicitudPrestamoMapper.to_create_local_request(token, payload)
        response = service.create_local(request)
        return JSONResponse(status_code=201, content=response.model_dump())

    @staticmethod
    @router.post("/interbibliotecario", response_model=SolicitudPrestamoRes, status_code=201)
    def create_interbibliotecaria(
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: SolicitudPrestamoServiceI = Depends(get_solicitud_prestamo_service),
    ) -> JSONResponse:
        logger.info("POST /solicitudes-prestamo/interbibliotecario called")
        request = SolicitudPrestamoMapper.to_create_interbibliotecaria_request(token, payload)
        response = service.create_interbibliotecaria(request)
        return JSONResponse(status_code=201, content=response.model_dump())

    @staticmethod
    @router.patch("/{id}/estado", response_model=SolicitudPrestamoRes)
    def update_estado(
        id: int,
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: SolicitudPrestamoServiceI = Depends(get_solicitud_prestamo_service),
    ) -> JSONResponse:
        logger.info("PATCH /solicitudes-prestamo/%s/estado called", id)
        request = SolicitudPrestamoMapper.to_update_estado_request(token, id, payload)
        response = service.update_estado(request)
        return JSONResponse(status_code=200, content=response.model_dump())
