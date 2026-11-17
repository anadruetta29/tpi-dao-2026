import { MovimientoSedesReport } from "@/domain/reports/movimiento-sedes-report";
import { LogisticaIncidenciasReport } from "@/domain/reports/logistica-incidencias-report";
import { PrestamosVencidosMultasReport } from "@/domain/reports/prestamos-vencidos-multas-report";
import { LibrosInterbibliotecariosReport } from "@/domain/reports/libros-interbibliotecarios-report";

export interface GetMovimientoSedesReportRes {
    report: MovimientoSedesReport;
}

export interface GetLogisticaIncidenciasReportRes {
    report: LogisticaIncidenciasReport;
}

export interface GetPrestamosVencidosMultasReportRes {
    report: PrestamosVencidosMultasReport;
}

export interface GetLibrosInterbibliotecariosReportRes {
    report: LibrosInterbibliotecariosReport;
}
