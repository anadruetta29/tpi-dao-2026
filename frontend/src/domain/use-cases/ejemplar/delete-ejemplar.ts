import { EjemplarRepositoryI } from "../../repositories/ejemplar";
import { Session } from "../../entities/session";

export interface DeleteEjemplarCommand {
    session: Session;
    id: string;
}

export class DeleteEjemplarUseCase {

    private readonly ejemplarRepository: EjemplarRepositoryI;

    constructor(ejemplarRepository: EjemplarRepositoryI) {
        this.ejemplarRepository = ejemplarRepository;
    }

    public async execute(command: DeleteEjemplarCommand): Promise<void> {
        await this.ejemplarRepository.deleteEjemplar({
            session: command.session,
            id: command.id
        });
    }

}
