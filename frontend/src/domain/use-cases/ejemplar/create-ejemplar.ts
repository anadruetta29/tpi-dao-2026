import { EjemplarRepositoryI } from "../../repositories/ejemplar";
import { Session } from "../../entities/session";
import { Ejemplar } from "../../entities/ejemplar";
import { EstadoEjemplar } from "../../entities/estado-ejemplar";

export interface CreateEjemplarCommand {
    session: Session;
    codigo: string;
    libro_id: string;
    sede_id: string;
}

export interface CreateEjemplarResult {
    id: string;
    ejemplar?: Ejemplar | null;
}

export class CreateEjemplarUseCase {

    private readonly ejemplarRepository: EjemplarRepositoryI;

    constructor(ejemplarRepository: EjemplarRepositoryI) {
        this.ejemplarRepository = ejemplarRepository;
    }

    public async execute(command: CreateEjemplarCommand): Promise<CreateEjemplarResult> {
        const response = await this.ejemplarRepository.createEjemplar({
            session: command.session,
            codigo: command.codigo,
            libro_id: command.libro_id,
            sede_id: command.sede_id,
            estado: EstadoEjemplar.DISPONIBLE
        });

        return {
            id: response.id,
            ejemplar: response.ejemplar
        };
    }

}
