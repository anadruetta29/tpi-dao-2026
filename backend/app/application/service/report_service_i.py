from abc import ABC, abstractmethod
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


class ReportServiceI(ABC):
    @abstractmethod
    def get_movimiento_sedes(self, dto: GetMovimientoSedesReportReq) -> MovimientoSedesReportRes:
        pass

    @abstractmethod
    def get_logistica_incidencias(
        self, dto: GetLogisticaIncidenciasReportReq
    ) -> LogisticaIncidenciasReportRes:
        pass

    @abstractmethod
    def get_prestamos_vencidos_multas(
        self, dto: GetPrestamosVencidosMultasReportReq
    ) -> PrestamosVencidosMultasReportRes:
        pass

    @abstractmethod
    def get_libros_interbibliotecarios(
        self, dto: GetLibrosInterbibliotecariosReportReq
    ) -> LibrosInterbibliotecariosReportRes:
        pass
