import { EjemplarRepositoryI } from "../../repositories/ejemplar";
import { Session } from "../../entities/session";
import { Ejemplar } from "../../entities/ejemplar";
import { EstadoEjemplar } from "../../entities/estado-ejemplar";

export interface UpdateEjemplarEstadoCommand {
    session: Session;
    id: string;
    estado: EstadoEjemplar;
}

export interface UpdateEjemplarEstadoResult {
    ejemplar: Ejemplar;
}

export class UpdateEjemplarEstadoUseCase {

    private readonly ejemplarRepository: EjemplarRepositoryI;

    constructor(ejemplarRepository: EjemplarRepositoryI) {
        this.ejemplarRepository = ejemplarRepository;
    }

    public async execute(command: UpdateEjemplarEstadoCommand): Promise<UpdateEjemplarEstadoResult> {
        const response = await this.ejemplarRepository.updateEjemplarEstado({
            session: command.session,
            id: command.id,
            estado: command.estado
        });

        return {
            ejemplar: response.ejemplar
        };
    }

}
