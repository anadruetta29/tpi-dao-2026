from datetime import date
from typing import Optional
from app.domain.report import (
    LibrosInterbibliotecariosReport,
    LogisticaIncidenciasReport,
    MovimientoSedesReport,
    PrestamosVencidosMultasReport,
)
from app.presentation.dto.report.request import (
    GetLibrosInterbibliotecariosReportReq,
    GetLogisticaIncidenciasReportReq,
    GetMovimientoSedesReportReq,
    GetPrestamosVencidosMultasReportReq,
)
from app.presentation.dto.report.response import (
    LibrosInterbibliotecariosReportRes,
    LogisticaIncidenciasReportRes,
    MovimientoSedesReportRes,
    PrestamosVencidosMultasReportRes,
)


class ReportMapper:
    @staticmethod
    def to_movimiento_sedes_request(
        token: Optional[str],
        fecha_desde: Optional[date] = None,
        fecha_hasta: Optional[date] = None,
        sede_origen_id: Optional[int] = None,
        sede_destino_id: Optional[int] = None,
    ) -> GetMovimientoSedesReportReq:
        return GetMovimientoSedesReportReq.build(
            token=token,
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta,
            sede_origen_id=sede_origen_id,
            sede_destino_id=sede_destino_id,
        )

    @staticmethod
    def to_logistica_incidencias_request(
        token: Optional[str],
        fecha_desde: Optional[date] = None,
        fecha_hasta: Optional[date] = None,
        sede_origen_id: Optional[int] = None,
    ) -> GetLogisticaIncidenciasReportReq:
        return GetLogisticaIncidenciasReportReq.build(
            token=token,
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta,
            sede_origen_id=sede_origen_id,
        )

    @staticmethod
    def to_prestamos_vencidos_multas_request(
        token: Optional[str],
        sede_id: Optional[int] = None,
    ) -> GetPrestamosVencidosMultasReportReq:
        return GetPrestamosVencidosMultasReportReq.build(token=token, sede_id=sede_id)

    @staticmethod
    def to_libros_interbibliotecarios_request(
        token: Optional[str],
        sede_destino_id: Optional[int] = None,
        limit: Optional[int] = None,
    ) -> GetLibrosInterbibliotecariosReportReq:
        return GetLibrosInterbibliotecariosReportReq.build(
            token=token,
            sede_destino_id=sede_destino_id,
            limit=limit,
        )

    @staticmethod
    def to_movimiento_sedes_response(report: MovimientoSedesReport) -> MovimientoSedesReportRes:
        return MovimientoSedesReportRes.from_domain(report)

    @staticmethod
    def to_logistica_incidencias_response(
        report: LogisticaIncidenciasReport,
    ) -> LogisticaIncidenciasReportRes:
        return LogisticaIncidenciasReportRes.from_domain(report)

    @staticmethod
    def to_prestamos_vencidos_multas_response(
        report: PrestamosVencidosMultasReport,
    ) -> PrestamosVencidosMultasReportRes:
        return PrestamosVencidosMultasReportRes.from_domain(report)

    @staticmethod
    def to_libros_interbibliotecarios_response(
        report: LibrosInterbibliotecariosReport,
    ) -> LibrosInterbibliotecariosReportRes:
        return LibrosInterbibliotecariosReportRes.from_domain(report)
