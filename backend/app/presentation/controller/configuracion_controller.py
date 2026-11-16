import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Depends, Header
from fastapi.responses import JSONResponse
from app.application.service.tarifa_multa_service_i import TarifaMultaServiceI
from app.core.bean.dependencies import get_tarifa_multa_service
from app.presentation.dto.configuracion.mapper.tarifa_multa_mapper import TarifaMultaMapper
from app.presentation.dto.configuracion.response.tarifa_multa_res import (
    GetAllTarifasMultaRes,
    TarifaMultaRes,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/configuracion", tags=["Configuración"])


class ConfiguracionController:
    @staticmethod
    @router.get("/multas", response_model=GetAllTarifasMultaRes)
    def get_tarifas_multa(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: TarifaMultaServiceI = Depends(get_tarifa_multa_service),
    ) -> JSONResponse:
        logger.info("GET /configuracion/multas called")
        response = service.get_all(token)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.put("/multas/{motivo}", response_model=TarifaMultaRes)
    def update_tarifa_multa(
        motivo: str,
        payload: Dict[str, Any] = Body(...),
        token: Optional[str] = Header(default=None, alias="Authorization"),
        service: TarifaMultaServiceI = Depends(get_tarifa_multa_service),
    ) -> JSONResponse:
        logger.info("PUT /configuracion/multas/%s called", motivo)
        request = TarifaMultaMapper.to_update_request(token, motivo, payload)
        response = service.update(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))
