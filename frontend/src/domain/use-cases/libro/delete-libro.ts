import { LibroRepositoryI } from "../../repositories/libro";
import { Session } from "../../entities/session";

export interface DeleteLibroCommand {
    session: Session;
    id: string;
}

export class DeleteLibroUseCase {

    private readonly libroRepository: LibroRepositoryI;

    constructor(libroRepository: LibroRepositoryI) {
        this.libroRepository = libroRepository;
    }

    public async execute(command: DeleteLibroCommand): Promise<void> {
        await this.libroRepository.deleteLibro({
            session: command.session,
            id: command.id
        });
    }

}
