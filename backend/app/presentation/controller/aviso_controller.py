from typing import Optional
from fastapi import APIRouter, Depends, Header
from fastapi.responses import JSONResponse
from app.application.service.aviso_service import AvisoService
from app.core.bean.dependencies import get_aviso_service
from app.presentation.dto.aviso.response.aviso_res import AvisoRes, GetAllAvisosRes

router = APIRouter(prefix="/avisos", tags=["Avisos"])


class AvisoController:
    @staticmethod
    @router.get("", response_model=GetAllAvisosRes)
    def get_all(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: AvisoService = Depends(get_aviso_service),
    ) -> JSONResponse:
        return JSONResponse(status_code=200, content=service.listar(token).model_dump(mode="json"))

    @staticmethod
    @router.patch("/{id}/lectura", response_model=AvisoRes)
    def marcar_leido(
        id: int,
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: AvisoService = Depends(get_aviso_service),
    ) -> JSONResponse:
        return JSONResponse(status_code=200, content=service.marcar_leido(token, id).model_dump(mode="json"))
