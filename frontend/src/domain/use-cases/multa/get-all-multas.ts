import { MultaRepositoryI } from "../../repositories/multa";
import { type Session } from "../../entities/session";
import { Multa } from "../../entities/multa";
import { EstadoMulta } from "../../entities/estado-multa";
import { type MultaFilters } from "../../filters/multa-filters";

export interface GetAllMultasCommand {
    session: Session;
    socio_id?: string | null;
    estado?: string | EstadoMulta | null;
    filters?: MultaFilters;
}

export interface GetAllMultasResult {
    multas: Multa[];
    total: number;
}

export class GetAllMultasUseCase {

    private readonly multaRepository: MultaRepositoryI;

    constructor(multaRepository: MultaRepositoryI) {
        this.multaRepository = multaRepository;
    }

    public async execute(command: GetAllMultasCommand): Promise<GetAllMultasResult> {
        const response = await this.multaRepository.getAllMultas({
            session: command.session,
            socio_id: command.socio_id,
            estado: command.estado,
            filters: command.filters
        });

        return {
            multas: response.multas,
            total: response.total
        };
    }

}
