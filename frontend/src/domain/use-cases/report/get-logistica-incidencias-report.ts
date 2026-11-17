import { ReportRepositoryI } from "../../repositories/report";
import { type Session } from "../../entities/session";
import { LogisticaIncidenciasReport } from "../../reports/logistica-incidencias-report";

export interface GetLogisticaIncidenciasReportCommand {
    session: Session;
    fechaDesde?: string | null;
    fechaHasta?: string | null;
    sedeOrigenId?: string | null;
}

export class GetLogisticaIncidenciasReportUseCase {
    private readonly reportRepository: ReportRepositoryI;

    constructor(reportRepository: ReportRepositoryI) {
        this.reportRepository = reportRepository;
    }

    public async execute(command: GetLogisticaIncidenciasReportCommand): Promise<LogisticaIncidenciasReport> {
        const res = await this.reportRepository.getLogisticaIncidencias(command);
        return res.report;
    }
}
