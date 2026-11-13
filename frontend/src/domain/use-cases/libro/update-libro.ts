import { LibroRepositoryI } from "../../repositories/libro";
import { Session } from "../../entities/session";
import { Libro } from "../../entities/libro";

export interface UpdateLibroCommand {
    session: Session;
    id: string;
    titulo?: string;
    añoPublicacion?: number;
    editorial?: string;
    edicion?: string;
}

export interface UpdateLibroResult {
    id: string;
    libro?: Libro | null;
}

export class UpdateLibroUseCase {

    private readonly libroRepository: LibroRepositoryI;

    constructor(libroRepository: LibroRepositoryI) {
        this.libroRepository = libroRepository;
    }

    public async execute(command: UpdateLibroCommand): Promise<UpdateLibroResult> {
        const response = await this.libroRepository.updateLibro({
            session: command.session,
            id: command.id,
            titulo: command.titulo,
            añoPublicacion: command.añoPublicacion,
            editorial: command.editorial,
            edicion: command.edicion
        });

        return {
            id: response.id,
            libro: response.libro
        };
    }

}
