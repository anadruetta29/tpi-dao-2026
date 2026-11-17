import { ReportRepositoryI } from "../../repositories/report";
import { type Session } from "../../entities/session";
import { MovimientoSedesReport } from "../../reports/movimiento-sedes-report";

export interface GetMovimientoSedesReportCommand {
    session: Session;
    fechaDesde?: string | null;
    fechaHasta?: string | null;
    sedeOrigenId?: string | null;
    sedeDestinoId?: string | null;
}

export class GetMovimientoSedesReportUseCase {
    private readonly reportRepository: ReportRepositoryI;

    constructor(reportRepository: ReportRepositoryI) {
        this.reportRepository = reportRepository;
    }

    public async execute(command: GetMovimientoSedesReportCommand): Promise<MovimientoSedesReport> {
        const res = await this.reportRepository.getMovimientoSedes(command);
        return res.report;
    }
}
