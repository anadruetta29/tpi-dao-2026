import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Depends, Header, Query, Response
from fastapi.responses import JSONResponse
from app.application.service.libro_service_i import LibroServiceI
from app.core.bean.dependencies import get_libro_service
from app.presentation.dto.libro.mapper import LibroMapper
from app.presentation.dto.libro.response import (
    GetAllLibrosRes,
    GetLibroDisponibilidadRes,
    LibroRes,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/libros", tags=["Libros"])


class LibroController:
    @staticmethod
    @router.get("", response_model=GetAllLibrosRes)
    def get_all(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        titulo: Optional[str] = Query(default=None),
        autor: Optional[str] = Query(default=None),
        editorial: Optional[str] = Query(default=None),
        service: LibroServiceI = Depends(get_libro_service),
    ) -> JSONResponse:
        logger.info("GET /libros called")
        request = LibroMapper.to_get_all_request(token, titulo, autor, editorial)
        response = service.get_all(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.get("/{id}", response_model=LibroRes)
    def get_by_id(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: LibroServiceI = Depends(get_libro_service),
    ) -> JSONResponse:
        logger.info("GET /libros/%s called", id)
        request = LibroMapper.to_get_by_id_request(token, id)
        response = service.get_by_id(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.get("/{id}/disponibilidad", response_model=GetLibroDisponibilidadRes)
    def get_disponibilidad(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: LibroServiceI = Depends(get_libro_service),
    ) -> JSONResponse:
        logger.info("GET /libros/%s/disponibilidad called", id)
        request = LibroMapper.to_get_by_id_request(token, id)
        response = service.get_disponibilidad(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.post("", response_model=LibroRes, status_code=201)
    def create(
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: LibroServiceI = Depends(get_libro_service),
    ) -> JSONResponse:
        logger.info("POST /libros called")
        request = LibroMapper.to_create_request(token, payload)
        response = service.create(request)
        return JSONResponse(status_code=201, content=response.model_dump())

    @staticmethod
    @router.put("/{id}", response_model=LibroRes)
    def update(
        id: int,
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: LibroServiceI = Depends(get_libro_service),
    ) -> JSONResponse:
        logger.info("PUT /libros/%s called", id)
        request = LibroMapper.to_update_request(token, id, payload)
        response = service.update(request)
        return JSONResponse(status_code=200, content=response.model_dump())

    @staticmethod
    @router.delete("/{id}", status_code=204)
    def delete(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: LibroServiceI = Depends(get_libro_service),
    ) -> Response:
        logger.info("DELETE /libros/%s called", id)
        request = LibroMapper.to_delete_request(token, id)
        service.delete(request)
        return Response(status_code=204)
