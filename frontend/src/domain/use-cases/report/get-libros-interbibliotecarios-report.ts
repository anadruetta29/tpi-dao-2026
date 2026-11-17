import { ReportRepositoryI } from "../../repositories/report";
import { type Session } from "../../entities/session";
import { LibrosInterbibliotecariosReport } from "../../reports/libros-interbibliotecarios-report";

export interface GetLibrosInterbibliotecariosReportCommand {
    session: Session;
    sedeDestinoId?: string | null;
    limit?: number | null;
}

export class GetLibrosInterbibliotecariosReportUseCase {
    private readonly reportRepository: ReportRepositoryI;

    constructor(reportRepository: ReportRepositoryI) {
        this.reportRepository = reportRepository;
    }

    public async execute(command: GetLibrosInterbibliotecariosReportCommand): Promise<LibrosInterbibliotecariosReport> {
        const res = await this.reportRepository.getLibrosInterbibliotecarios(command);
        return res.report;
    }
}
