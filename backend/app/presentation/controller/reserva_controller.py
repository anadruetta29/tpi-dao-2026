import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Depends, Header, Query
from fastapi.responses import JSONResponse
from app.application.service.reserva_service_i import ReservaServiceI
from app.core.bean.dependencies import get_reserva_service
from app.domain.entity.estado_reserva import EstadoReserva
from app.presentation.dto.reserva.mapper import ReservaMapper
from app.presentation.dto.reserva.response import GetAllReservasRes, ReservaRes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reservas", tags=["Reservas"])


class ReservaController:
    @staticmethod
    @router.get("", response_model=GetAllReservasRes)
    def get_all(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        libro_id: Optional[int] = Query(default=None),
        socio_id: Optional[int] = Query(default=None),
        sede_id: Optional[int] = Query(default=None),
        estado: Optional[EstadoReserva] = Query(default=None),
        service: ReservaServiceI = Depends(get_reserva_service),
    ) -> JSONResponse:
        logger.info("GET /reservas called")
        request = ReservaMapper.to_get_all_request(token, libro_id, socio_id, sede_id, estado)
        response = service.get_all(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.get("/{id}", response_model=ReservaRes)
    def get_by_id(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: ReservaServiceI = Depends(get_reserva_service),
    ) -> JSONResponse:
        logger.info("GET /reservas/%s called", id)
        request = ReservaMapper.to_get_by_id_request(token, id)
        response = service.get_by_id(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.post("", response_model=ReservaRes, status_code=201)
    def create(
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: ReservaServiceI = Depends(get_reserva_service),
    ) -> JSONResponse:
        logger.info("POST /reservas called")
        request = ReservaMapper.to_create_request(token, payload)
        response = service.create(request)
        return JSONResponse(status_code=201, content=response.model_dump(mode="json"))

    @staticmethod
    @router.patch("/{id}/estado", response_model=ReservaRes)
    def update_estado(
        id: int,
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: ReservaServiceI = Depends(get_reserva_service),
    ) -> JSONResponse:
        logger.info("PATCH /reservas/%s/estado called", id)
        request = ReservaMapper.to_update_estado_request(token, id, payload)
        response = service.update_estado(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))
