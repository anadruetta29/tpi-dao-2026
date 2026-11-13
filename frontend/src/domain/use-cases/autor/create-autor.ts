import { AutorRepositoryI } from "../../repositories/autor";
import { Session } from "../../entities/session";
import { Autor } from "../../entities/autor";

export interface CreateAutorCommand {
    session: Session;
    nombre: string;
    apellido: string;
}

export interface CreateAutorResult {
    id: string;
    autor?: Autor | null;
}

export class CreateAutorUseCase {

    private readonly autorRepository: AutorRepositoryI;

    constructor(autorRepository: AutorRepositoryI) {
        this.autorRepository = autorRepository;
    }

    public async execute(command: CreateAutorCommand): Promise<CreateAutorResult> {
        const response = await this.autorRepository.createAutor({
            session: command.session,
            nombre: command.nombre,
            apellido: command.apellido
        });

        return {
            id: response.id,
            autor: response.autor
        };
    }

}
