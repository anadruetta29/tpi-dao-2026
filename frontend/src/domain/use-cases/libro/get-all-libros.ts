import { LibroRepositoryI } from "../../repositories/libro";
import { Session } from "../../entities/session";
import { Libro } from "../../entities/libro";
import { LibroFilters } from "../../filters/libro-filters";

export interface GetAllLibrosCommand {
    session: Session;
    titulo?: string | null;
    autor?: string | null;
    editorial?: string | null;
    filters?: LibroFilters;
}

export interface GetAllLibrosResult {
    libros: Libro[];
    total: number;
}

export class GetAllLibrosUseCase {

    private readonly libroRepository: LibroRepositoryI;

    constructor(libroRepository: LibroRepositoryI) {
        this.libroRepository = libroRepository;
    }

    public async execute(command: GetAllLibrosCommand): Promise<GetAllLibrosResult> {
        const response = await this.libroRepository.getAllLibros({
            session: command.session,
            titulo: command.titulo,
            autor: command.autor,
            editorial: command.editorial,
            filters: command.filters
        });

        return {
            libros: response.libros,
            total: response.total
        };
    }

}
