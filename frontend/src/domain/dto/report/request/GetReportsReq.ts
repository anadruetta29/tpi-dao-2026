import { type Session } from "@/domain/entities/session";

export interface GetMovimientoSedesReportReq {
    session: Session;
    fechaDesde?: string | null;
    fechaHasta?: string | null;
    sedeOrigenId?: string | null;
    sedeDestinoId?: string | null;
}

export interface GetLogisticaIncidenciasReportReq {
    session: Session;
    fechaDesde?: string | null;
    fechaHasta?: string | null;
    sedeOrigenId?: string | null;
}

export interface GetPrestamosVencidosMultasReportReq {
    session: Session;
    sedeId?: string | null;
}

export interface GetLibrosInterbibliotecariosReportReq {
    session: Session;
    sedeDestinoId?: string | null;
    limit?: number | null;
}
