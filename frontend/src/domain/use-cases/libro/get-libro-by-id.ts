import { LibroRepositoryI } from "../../repositories/libro";
import { Session } from "../../entities/session";
import { Libro } from "../../entities/libro";

export interface GetLibroByIdCommand {
    session: Session;
    id: string;
}

export interface GetLibroByIdResult {
    libro: Libro;
}

export class GetLibroByIdUseCase {

    private readonly libroRepository: LibroRepositoryI;

    constructor(libroRepository: LibroRepositoryI) {
        this.libroRepository = libroRepository;
    }

    public async execute(command: GetLibroByIdCommand): Promise<GetLibroByIdResult> {
        const response = await this.libroRepository.getLibroById({
            session: command.session,
            id: command.id
        });

        return {
            libro: response.libro
        };
    }

}
