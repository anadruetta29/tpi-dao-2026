import logging
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Header, Query
from fastapi.responses import JSONResponse
from app.application.service.report_service_i import ReportServiceI
from app.core.bean.dependencies import get_report_service
from app.presentation.dto.report.mapper import ReportMapper
from app.presentation.dto.report.response import (
    LibrosInterbibliotecariosReportRes,
    LogisticaIncidenciasReportRes,
    MovimientoSedesReportRes,
    PrestamosVencidosMultasReportRes,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["Reportes"])


class ReportController:
    @staticmethod
    @router.get("/movimiento-sedes", response_model=MovimientoSedesReportRes)
    def get_movimiento_sedes(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        fecha_desde: Optional[date] = Query(default=None),
        fecha_hasta: Optional[date] = Query(default=None),
        sede_origen_id: Optional[int] = Query(default=None, gt=0),
        sede_destino_id: Optional[int] = Query(default=None, gt=0),
        service: ReportServiceI = Depends(get_report_service),
    ) -> JSONResponse:
        logger.info("GET /reports/movimiento-sedes called")
        request = ReportMapper.to_movimiento_sedes_request(
            token=token,
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta,
            sede_origen_id=sede_origen_id,
            sede_destino_id=sede_destino_id,
        )
        response = service.get_movimiento_sedes(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.get("/logistica-incidencias", response_model=LogisticaIncidenciasReportRes)
    def get_logistica_incidencias(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        fecha_desde: Optional[date] = Query(default=None),
        fecha_hasta: Optional[date] = Query(default=None),
        sede_origen_id: Optional[int] = Query(default=None, gt=0),
        service: ReportServiceI = Depends(get_report_service),
    ) -> JSONResponse:
        logger.info("GET /reports/logistica-incidencias called")
        request = ReportMapper.to_logistica_incidencias_request(
            token=token,
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta,
            sede_origen_id=sede_origen_id,
        )
        response = service.get_logistica_incidencias(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.get("/prestamos-vencidos-multas", response_model=PrestamosVencidosMultasReportRes)
    def get_prestamos_vencidos_multas(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        sede_id: Optional[int] = Query(default=None, gt=0),
        service: ReportServiceI = Depends(get_report_service),
    ) -> JSONResponse:
        logger.info("GET /reports/prestamos-vencidos-multas called")
        request = ReportMapper.to_prestamos_vencidos_multas_request(
            token=token,
            sede_id=sede_id,
        )
        response = service.get_prestamos_vencidos_multas(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))

    @staticmethod
    @router.get("/libros-interbibliotecarios", response_model=LibrosInterbibliotecariosReportRes)
    def get_libros_interbibliotecarios(
        token: Optional[str] = Header(default=None, alias="Authorization"),
        sede_destino_id: Optional[int] = Query(default=None, gt=0),
        limit: Optional[int] = Query(default=None, ge=1, le=100),
        service: ReportServiceI = Depends(get_report_service),
    ) -> JSONResponse:
        logger.info("GET /reports/libros-interbibliotecarios called")
        request = ReportMapper.to_libros_interbibliotecarios_request(
            token=token,
            sede_destino_id=sede_destino_id,
            limit=limit,
        )
        response = service.get_libros_interbibliotecarios(request)
        return JSONResponse(status_code=200, content=response.model_dump(mode="json"))
