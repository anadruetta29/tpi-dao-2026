import { ReportRepositoryI } from "../../repositories/report";
import { type Session } from "../../entities/session";
import { PrestamosVencidosMultasReport } from "../../reports/prestamos-vencidos-multas-report";

export interface GetPrestamosVencidosMultasReportCommand {
    session: Session;
    sedeId?: string | null;
}

export class GetPrestamosVencidosMultasReportUseCase {
    private readonly reportRepository: ReportRepositoryI;

    constructor(reportRepository: ReportRepositoryI) {
        this.reportRepository = reportRepository;
    }

    public async execute(command: GetPrestamosVencidosMultasReportCommand): Promise<PrestamosVencidosMultasReport> {
        const res = await this.reportRepository.getPrestamosVencidosMultas(command);
        return res.report;
    }
}
