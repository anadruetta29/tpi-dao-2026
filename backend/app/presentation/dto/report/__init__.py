from app.presentation.dto.report.mapper import ReportMapper
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

__all__ = [
    "ReportMapper",
    "GetMovimientoSedesReportReq",
    "GetLogisticaIncidenciasReportReq",
    "GetPrestamosVencidosMultasReportReq",
    "GetLibrosInterbibliotecariosReportReq",
    "MovimientoSedesReportRes",
    "LogisticaIncidenciasReportRes",
    "PrestamosVencidosMultasReportRes",
    "LibrosInterbibliotecariosReportRes",
]
