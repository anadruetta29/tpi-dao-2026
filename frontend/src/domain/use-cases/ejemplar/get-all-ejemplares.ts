import { EjemplarRepositoryI } from "../../repositories/ejemplar";
import { Session } from "../../entities/session";
import { Ejemplar } from "../../entities/ejemplar";
import { EstadoEjemplar } from "../../entities/estado-ejemplar";
import { EjemplarFilters } from "../../filters/ejemplar-filters";

export interface GetAllEjemplaresCommand {
    session: Session;
    libro_id?: string | null;
    sede_id?: string | null;
    estado?: string | EstadoEjemplar | null;
    filters?: EjemplarFilters;
}

export interface GetAllEjemplaresResult {
    ejemplares: Ejemplar[];
    total: number;
}

export class GetAllEjemplaresUseCase {

    private readonly ejemplarRepository: EjemplarRepositoryI;

    constructor(ejemplarRepository: EjemplarRepositoryI) {
        this.ejemplarRepository = ejemplarRepository;
    }

    public async execute(command: GetAllEjemplaresCommand): Promise<GetAllEjemplaresResult> {
        const response = await this.ejemplarRepository.getAllEjemplares({
            session: command.session,
            libro_id: command.libro_id,
            sede_id: command.sede_id,
            estado: command.estado,
            filters: command.filters
        });

        return {
            ejemplares: response.ejemplares,
            total: response.total
        };
    }

}
