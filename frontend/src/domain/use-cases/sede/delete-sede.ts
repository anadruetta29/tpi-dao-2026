import { SedeRepositoryI } from "../../repositories/sede";
import { type Session } from "../../entities/session";

export interface DeleteSedeCommand {
    id: string;
    session: Session;
}

export class DeleteSedeUseCase {

    private readonly sedeRepository: SedeRepositoryI;

    constructor(sedeRepository: SedeRepositoryI) {
        this.sedeRepository = sedeRepository;
    }

    public async execute(command: DeleteSedeCommand): Promise<void> {
        await this.sedeRepository.deleteSede({
            id: command.id,
            session: command.session
        });
    }

}
