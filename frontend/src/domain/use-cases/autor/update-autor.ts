import { AutorRepositoryI } from "../../repositories/autor";
import { Session } from "../../entities/session";
import { Autor } from "../../entities/autor";

export interface UpdateAutorCommand {
    session: Session;
    id: string;
    nombre: string;
    apellido: string;
}

export interface UpdateAutorResult {
    id: string;
    autor?: Autor | null;
}

export class UpdateAutorUseCase {

    private readonly autorRepository: AutorRepositoryI;

    constructor(autorRepository: AutorRepositoryI) {
        this.autorRepository = autorRepository;
    }

    public async execute(command: UpdateAutorCommand): Promise<UpdateAutorResult> {
        const response = await this.autorRepository.updateAutor({
            session: command.session,
            id: command.id,
            nombre: command.nombre,
            apellido: command.apellido
        });

        return {
            id: response.id,
            autor: response.autor
        };
    }

}
