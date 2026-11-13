import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Depends, Header, Query
from fastapi.responses import JSONResponse
from app.application.service.multa_service_i import MultaServiceI
from app.core.bean.dependencies import get_multa_service
from app.domain.entity.estado_multa import EstadoMulta
from app.presentation.dto.multa.mapper import MultaMapper
from app.presentation.dto.multa.response import GetAllMultasRes, MultaRes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/multas", tags=["Multas"])


class MultaController:
    @staticmethod
    @router.get("", response_model=GetAllMultasRes)
    def get_all(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        socio_id: Optional[int] = Query(default=None),
        estado: Optional[EstadoMulta] = Query(default=None),
        service: MultaServiceI = Depends(get_multa_service),
    ) -> JSONResponse:
        logger.info("GET /multas called")
        request = MultaMapper.to_get_all_request(token, socio_id, estado)
        response = service.get_all(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.get("/{id}", response_model=MultaRes)
    def get_by_id(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: MultaServiceI = Depends(get_multa_service),
    ) -> JSONResponse:
        logger.info("GET /multas/%s called", id)
        request = MultaMapper.to_get_by_id_request(token, id)
        response = service.get_by_id(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.post("", response_model=MultaRes, status_code=201)
    def create(
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: MultaServiceI = Depends(get_multa_service),
    ) -> JSONResponse:
        logger.info("POST /multas called")
        request = MultaMapper.to_create_request(token, payload)
        response = service.create(request)
        return JSONResponse(status_code=201, content=response.model_dump(mode="json"))

    @staticmethod
    @router.patch("/{id}/pagar", response_model=MultaRes)
    def pagar(
        id: int,
        payload: Optional[Dict[str, Any]] = Body(default=None),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: MultaServiceI = Depends(get_multa_service),
    ) -> JSONResponse:
        logger.info("PATCH /multas/%s/pagar called", id)
        request = MultaMapper.to_action_request(token, id, payload)
        response = service.pagar(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.patch("/{id}/anular", response_model=MultaRes)
    def anular(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: MultaServiceI = Depends(get_multa_service),
    ) -> JSONResponse:
        logger.info("PATCH /multas/%s/anular called", id)
        request = MultaMapper.to_action_request(token, id)
        response = service.anular(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))
