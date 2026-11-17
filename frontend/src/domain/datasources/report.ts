import {
    type GetLibrosInterbibliotecariosReportReq,
    type GetLogisticaIncidenciasReportReq,
    type GetMovimientoSedesReportReq,
    type GetPrestamosVencidosMultasReportReq
} from "../dto/report/request/GetReportsReq";
import {
    type GetLibrosInterbibliotecariosReportRes,
    type GetLogisticaIncidenciasReportRes,
    type GetMovimientoSedesReportRes,
    type GetPrestamosVencidosMultasReportRes
} from "../dto/report/response/GetReportsRes";

export abstract class ReportDataSourceI {
    abstract getMovimientoSedes(dto: GetMovimientoSedesReportReq): Promise<GetMovimientoSedesReportRes>;
    abstract getLogisticaIncidencias(dto: GetLogisticaIncidenciasReportReq): Promise<GetLogisticaIncidenciasReportRes>;
    abstract getPrestamosVencidosMultas(dto: GetPrestamosVencidosMultasReportReq): Promise<GetPrestamosVencidosMultasReportRes>;
    abstract getLibrosInterbibliotecarios(dto: GetLibrosInterbibliotecariosReportReq): Promise<GetLibrosInterbibliotecariosReportRes>;
}
