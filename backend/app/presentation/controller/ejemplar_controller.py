import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Depends, Header, Query
from fastapi.responses import JSONResponse
from app.application.service.ejemplar_service_i import EjemplarServiceI
from app.core.bean.dependencies import get_ejemplar_service
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.presentation.dto.ejemplar.mapper import EjemplarMapper
from app.presentation.dto.ejemplar.response import EjemplarRes, GetAllEjemplaresRes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ejemplares", tags=["Ejemplares"])


class EjemplarController:
    @staticmethod
    @router.get("", response_model=GetAllEjemplaresRes)
    def get_all(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        libro_id: Optional[int] = Query(default=None),
        sede_id: Optional[int] = Query(default=None),
        estado: Optional[EstadoEjemplar] = Query(default=None),
        service: EjemplarServiceI = Depends(get_ejemplar_service),
    ) -> JSONResponse:
        logger.info("GET /ejemplares called")
        request = EjemplarMapper.to_get_all_request(token, libro_id, sede_id, estado)
        response = service.get_all(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.get("/{id}", response_model=EjemplarRes)
    def get_by_id(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: EjemplarServiceI = Depends(get_ejemplar_service),
    ) -> JSONResponse:
        logger.info("GET /ejemplares/%s called", id)
        request = EjemplarMapper.to_get_by_id_request(token, id)
        response = service.get_by_id(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.post("", response_model=EjemplarRes, status_code=201)
    def create(
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: EjemplarServiceI = Depends(get_ejemplar_service),
    ) -> JSONResponse:
        logger.info("POST /ejemplares called")
        request = EjemplarMapper.to_create_request(token, payload)
        response = service.create(request)
        return JSONResponse(status_code=201, content=response.model_dump())
