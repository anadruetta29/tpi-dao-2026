import { EjemplarRepositoryI } from "../../repositories/ejemplar";
import { Session } from "../../entities/session";
import { Ejemplar } from "../../entities/ejemplar";

export interface GetEjemplarByIdCommand {
    session: Session;
    id: string;
}

export interface GetEjemplarByIdResult {
    ejemplar: Ejemplar;
}

export class GetEjemplarByIdUseCase {

    private readonly ejemplarRepository: EjemplarRepositoryI;

    constructor(ejemplarRepository: EjemplarRepositoryI) {
        this.ejemplarRepository = ejemplarRepository;
    }

    public async execute(command: GetEjemplarByIdCommand): Promise<GetEjemplarByIdResult> {
        const response = await this.ejemplarRepository.getEjemplarById({
            session: command.session,
            id: command.id
        });

        return {
            ejemplar: response.ejemplar
        };
    }

}
