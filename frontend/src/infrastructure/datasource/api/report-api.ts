import { HTTPClient } from "@/core/adapters/http-client";
import { CacheTags, withCacheTags } from "@/core/config/cache";
import { ReportDataSourceI } from "@/domain/datasources/report";
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
import { ErrorHandler } from "@/domain/messages";
import { LibrosInterbibliotecariosReport } from "@/domain/reports/libros-interbibliotecarios-report";
import { LogisticaIncidenciasReport } from "@/domain/reports/logistica-incidencias-report";
import { MovimientoSedesReport } from "@/domain/reports/movimiento-sedes-report";
import { PrestamosVencidosMultasReport } from "@/domain/reports/prestamos-vencidos-multas-report";

export class ReportApiDataSource implements ReportDataSourceI {
    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async getMovimientoSedes(dto: GetMovimientoSedesReportReq): Promise<GetMovimientoSedesReportRes> {
        try {
            const params: Record<string, any> = {};
            if (dto.fechaDesde) params.fecha_desde = dto.fechaDesde;
            if (dto.fechaHasta) params.fecha_hasta = dto.fechaHasta;
            if (dto.sedeOrigenId) params.sede_origen_id = Number(dto.sedeOrigenId);
            if (dto.sedeDestinoId) params.sede_destino_id = Number(dto.sedeDestinoId);

            const response = await this.httpClient.get(
                "/reports/movimiento-sedes",
                params,
                dto.session?.accessToken,
                withCacheTags(CacheTags.REPORTS)
            );

            return {
                report: MovimientoSedesReport.fromObject(response) ?? new MovimientoSedesReport()
            };
        } catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getLogisticaIncidencias(
        dto: GetLogisticaIncidenciasReportReq
    ): Promise<GetLogisticaIncidenciasReportRes> {
        try {
            const params: Record<string, any> = {};
            if (dto.fechaDesde) params.fecha_desde = dto.fechaDesde;
            if (dto.fechaHasta) params.fecha_hasta = dto.fechaHasta;
            if (dto.sedeOrigenId) params.sede_origen_id = Number(dto.sedeOrigenId);

            const response = await this.httpClient.get(
                "/reports/logistica-incidencias",
                params,
                dto.session?.accessToken,
                withCacheTags(CacheTags.REPORTS)
            );

            return {
                report: LogisticaIncidenciasReport.fromObject(response) ?? new LogisticaIncidenciasReport()
            };
        } catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getPrestamosVencidosMultas(
        dto: GetPrestamosVencidosMultasReportReq
    ): Promise<GetPrestamosVencidosMultasReportRes> {
        try {
            const params: Record<string, any> = {};
            if (dto.sedeId) params.sede_id = Number(dto.sedeId);

            const response = await this.httpClient.get(
                "/reports/prestamos-vencidos-multas",
                params,
                dto.session?.accessToken,
                withCacheTags(CacheTags.REPORTS)
            );

            return {
                report: PrestamosVencidosMultasReport.fromObject(response) ?? new PrestamosVencidosMultasReport()
            };
        } catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getLibrosInterbibliotecarios(
        dto: GetLibrosInterbibliotecariosReportReq
    ): Promise<GetLibrosInterbibliotecariosReportRes> {
        try {
            const params: Record<string, any> = {};
            if (dto.sedeDestinoId) params.sede_destino_id = Number(dto.sedeDestinoId);
            if (dto.limit) params.limit = dto.limit;

            const response = await this.httpClient.get(
                "/reports/libros-interbibliotecarios",
                params,
                dto.session?.accessToken,
                withCacheTags(CacheTags.REPORTS)
            );

            return {
                report: LibrosInterbibliotecariosReport.fromObject(response) ?? new LibrosInterbibliotecariosReport()
            };
        } catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }
}
