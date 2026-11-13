import { LibroRepositoryI } from "../../repositories/libro";
import { Session } from "../../entities/session";
import { Libro } from "../../entities/libro";

export interface CreateLibroCommand {
    session: Session;
    titulo: string;
    añoPublicacion: number;
    editorial: string;
    edicion: string;
    autoresIds?: string[];
}

export interface CreateLibroResult {
    id: string;
    libro?: Libro | null;
}

export class CreateLibroUseCase {

    private readonly libroRepository: LibroRepositoryI;

    constructor(libroRepository: LibroRepositoryI) {
        this.libroRepository = libroRepository;
    }

    public async execute(command: CreateLibroCommand): Promise<CreateLibroResult> {
        const response = await this.libroRepository.createLibro({
            session: command.session,
            titulo: command.titulo,
            añoPublicacion: command.añoPublicacion,
            editorial: command.editorial,
            edicion: command.edicion,
            autoresIds: command.autoresIds
        });

        return {
            id: response.id,
            libro: response.libro
        };
    }

}
