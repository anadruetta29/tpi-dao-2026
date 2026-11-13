import { LibroRepositoryI } from "../../repositories/libro";
import { Session } from "../../entities/session";
import { type LibroDisponibilidadSedeItem } from "../../dto/libro/response/GetLibroDisponibilidadRes";

export interface GetLibroDisponibilidadCommand {
    session: Session;
    id: string;
}

export interface GetLibroDisponibilidadResult {
    libroId: string;
    sedes: LibroDisponibilidadSedeItem[];
}

export class GetLibroDisponibilidadUseCase {

    private readonly libroRepository: LibroRepositoryI;

    constructor(libroRepository: LibroRepositoryI) {
        this.libroRepository = libroRepository;
    }

    public async execute(command: GetLibroDisponibilidadCommand): Promise<GetLibroDisponibilidadResult> {
        const response = await this.libroRepository.getLibroDisponibilidad({
            session: command.session,
            id: command.id
        });

        return {
            libroId: response.libroId,
            sedes: response.sedes
        };
    }

}
