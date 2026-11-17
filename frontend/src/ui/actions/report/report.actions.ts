import { type ActionState } from "@/core/types";
import { Session } from "@/domain/entities/session";
import { ErrorMessages } from "@/domain/messages";
import { LibrosInterbibliotecariosReport } from "@/domain/reports/libros-interbibliotecarios-report";
import { LogisticaIncidenciasReport } from "@/domain/reports/logistica-incidencias-report";
import { MovimientoSedesReport } from "@/domain/reports/movimiento-sedes-report";
import { PrestamosVencidosMultasReport } from "@/domain/reports/prestamos-vencidos-multas-report";
import { GetLibrosInterbibliotecariosReportUseCase } from "@/domain/use-cases/report/get-libros-interbibliotecarios-report";
import { GetLogisticaIncidenciasReportUseCase } from "@/domain/use-cases/report/get-logistica-incidencias-report";
import { GetMovimientoSedesReportUseCase } from "@/domain/use-cases/report/get-movimiento-sedes-report";
import { GetPrestamosVencidosMultasReportUseCase } from "@/domain/use-cases/report/get-prestamos-vencidos-multas-report";
import { ReportApiDataSource } from "@/infrastructure/datasource/api/report-api";
import { AuthStorageDataSource } from "@/infrastructure/datasource/storage/auth-storage";
import { ReportRepository } from "@/infrastructure/repository/report";

const reportApiDataSource = new ReportApiDataSource();
const authStorageDataSource = new AuthStorageDataSource();
const reportRepository = new ReportRepository(reportApiDataSource);

const getMovimientoSedesUseCase = new GetMovimientoSedesReportUseCase(reportRepository);
const getLogisticaIncidenciasUseCase = new GetLogisticaIncidenciasReportUseCase(reportRepository);
const getPrestamosVencidosMultasUseCase = new GetPrestamosVencidosMultasReportUseCase(reportRepository);
const getLibrosInterbibliotecariosUseCase = new GetLibrosInterbibliotecariosReportUseCase(reportRepository);

function resolveSession(customSession?: Session | null): Session | null {
    return customSession ?? authStorageDataSource.getSession();
}

export interface MovimientoSedesReportParams {
    session?: Session | null;
    fechaDesde?: string | null;
    fechaHasta?: string | null;
    sedeOrigenId?: string | null;
    sedeDestinoId?: string | null;
}

export async function getMovimientoSedesReportAction(
    params: MovimientoSedesReportParams = {}
): Promise<ActionState<MovimientoSedesReport>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }
        const data = await getMovimientoSedesUseCase.execute({
            session,
            fechaDesde: params.fechaDesde,
            fechaHasta: params.fechaHasta,
            sedeOrigenId: params.sedeOrigenId,
            sedeDestinoId: params.sedeDestinoId
        });
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.UNEXPECTED_ERROR };
    }
}

export interface LogisticaIncidenciasReportParams {
    session?: Session | null;
    fechaDesde?: string | null;
    fechaHasta?: string | null;
    sedeOrigenId?: string | null;
}

export async function getLogisticaIncidenciasReportAction(
    params: LogisticaIncidenciasReportParams = {}
): Promise<ActionState<LogisticaIncidenciasReport>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }
        const data = await getLogisticaIncidenciasUseCase.execute({
            session,
            fechaDesde: params.fechaDesde,
            fechaHasta: params.fechaHasta,
            sedeOrigenId: params.sedeOrigenId
        });
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.UNEXPECTED_ERROR };
    }
}

export interface PrestamosVencidosMultasReportParams {
    session?: Session | null;
    sedeId?: string | null;
}

export async function getPrestamosVencidosMultasReportAction(
    params: PrestamosVencidosMultasReportParams = {}
): Promise<ActionState<PrestamosVencidosMultasReport>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }
        const data = await getPrestamosVencidosMultasUseCase.execute({
            session,
            sedeId: params.sedeId
        });
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.UNEXPECTED_ERROR };
    }
}

export interface LibrosInterbibliotecariosReportParams {
    session?: Session | null;
    sedeDestinoId?: string | null;
    limit?: number | null;
}

export async function getLibrosInterbibliotecariosReportAction(
    params: LibrosInterbibliotecariosReportParams = {}
): Promise<ActionState<LibrosInterbibliotecariosReport>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }
        const data = await getLibrosInterbibliotecariosUseCase.execute({
            session,
            sedeDestinoId: params.sedeDestinoId,
            limit: params.limit
        });
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.UNEXPECTED_ERROR };
    }
}
