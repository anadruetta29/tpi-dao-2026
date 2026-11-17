from app.application.service.report_service_i import ReportServiceI
from app.application.use_case.report import (
    GetLibrosInterbibliotecariosReportUseCase,
    GetLogisticaIncidenciasReportUseCase,
    GetMovimientoSedesReportUseCase,
    GetPrestamosVencidosMultasReportUseCase,
)
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


class ReportService(ReportServiceI):
    def __init__(
        self,
        movimiento_sedes_use_case: GetMovimientoSedesReportUseCase,
        logistica_incidencias_use_case: GetLogisticaIncidenciasReportUseCase,
        prestamos_vencidos_multas_use_case: GetPrestamosVencidosMultasReportUseCase,
        libros_interbibliotecarios_use_case: GetLibrosInterbibliotecariosReportUseCase,
    ) -> None:
        self.movimiento_sedes_use_case = movimiento_sedes_use_case
        self.logistica_incidencias_use_case = logistica_incidencias_use_case
        self.prestamos_vencidos_multas_use_case = prestamos_vencidos_multas_use_case
        self.libros_interbibliotecarios_use_case = libros_interbibliotecarios_use_case

    def get_movimiento_sedes(self, dto: GetMovimientoSedesReportReq) -> MovimientoSedesReportRes:
        result = self.movimiento_sedes_use_case.execute(
            GetMovimientoSedesReportUseCase.Command(
                token=dto.get_token(),
                fecha_desde=dto.get_fecha_desde(),
                fecha_hasta=dto.get_fecha_hasta(),
                sede_origen_id=dto.get_sede_origen_id(),
                sede_destino_id=dto.get_sede_destino_id(),
            )
        )
        return ReportMapper.to_movimiento_sedes_response(result.report)

    def get_logistica_incidencias(
        self, dto: GetLogisticaIncidenciasReportReq
    ) -> LogisticaIncidenciasReportRes:
        result = self.logistica_incidencias_use_case.execute(
            GetLogisticaIncidenciasReportUseCase.Command(
                token=dto.get_token(),
                fecha_desde=dto.get_fecha_desde(),
                fecha_hasta=dto.get_fecha_hasta(),
                sede_origen_id=dto.get_sede_origen_id(),
            )
        )
        return ReportMapper.to_logistica_incidencias_response(result.report)

    def get_prestamos_vencidos_multas(
        self, dto: GetPrestamosVencidosMultasReportReq
    ) -> PrestamosVencidosMultasReportRes:
        result = self.prestamos_vencidos_multas_use_case.execute(
            GetPrestamosVencidosMultasReportUseCase.Command(
                token=dto.get_token(),
                sede_id=dto.get_sede_id(),
            )
        )
        return ReportMapper.to_prestamos_vencidos_multas_response(result.report)

    def get_libros_interbibliotecarios(
        self, dto: GetLibrosInterbibliotecariosReportReq
    ) -> LibrosInterbibliotecariosReportRes:
        result = self.libros_interbibliotecarios_use_case.execute(
            GetLibrosInterbibliotecariosReportUseCase.Command(
                token=dto.get_token(),
                sede_destino_id=dto.get_sede_destino_id(),
                limit=dto.get_limit(),
            )
        )
        return ReportMapper.to_libros_interbibliotecarios_response(result.report)
