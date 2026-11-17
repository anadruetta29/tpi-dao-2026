import { ReportDataSourceI } from "@/domain/datasources/report";
import { ReportRepositoryI } from "@/domain/repositories/report";
import {
    type GetLibrosInterbibliotecariosReportReq,
    type GetLogisticaIncidenciasReportReq,
    type GetMovimientoSedesReportReq,
    type GetPrestamosVencidosMultasReportReq
} from "@/domain/dto/report/request/GetReportsReq";
import {
    type GetLibrosInterbibliotecariosReportRes,
    type GetLogisticaIncidenciasReportRes,
    type GetMovimientoSedesReportRes,
    type GetPrestamosVencidosMultasReportRes
} from "@/domain/dto/report/response/GetReportsRes";

export class ReportRepository implements ReportRepositoryI {
    private readonly dataSource: ReportDataSourceI;

    constructor(dataSource: ReportDataSourceI) {
        this.dataSource = dataSource;
    }

    public async getMovimientoSedes(dto: GetMovimientoSedesReportReq): Promise<GetMovimientoSedesReportRes> {
        return await this.dataSource.getMovimientoSedes(dto);
    }

    public async getLogisticaIncidencias(
        dto: GetLogisticaIncidenciasReportReq
    ): Promise<GetLogisticaIncidenciasReportRes> {
        return await this.dataSource.getLogisticaIncidencias(dto);
    }

    public async getPrestamosVencidosMultas(
        dto: GetPrestamosVencidosMultasReportReq
    ): Promise<GetPrestamosVencidosMultasReportRes> {
        return await this.dataSource.getPrestamosVencidosMultas(dto);
    }

    public async getLibrosInterbibliotecarios(
        dto: GetLibrosInterbibliotecariosReportReq
    ): Promise<GetLibrosInterbibliotecariosReportRes> {
        return await this.dataSource.getLibrosInterbibliotecarios(dto);
    }
}
