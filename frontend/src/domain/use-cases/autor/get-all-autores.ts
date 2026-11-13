import { AutorRepositoryI } from "../../repositories/autor";
import { Session } from "../../entities/session";
import { Autor } from "../../entities/autor";

export interface GetAllAutoresCommand {
    session: Session;
}

export interface GetAllAutoresResult {
    autores: Autor[];
    total: number;
}

export class GetAllAutoresUseCase {

    private readonly autorRepository: AutorRepositoryI;

    constructor(autorRepository: AutorRepositoryI) {
        this.autorRepository = autorRepository;
    }

    public async execute(command: GetAllAutoresCommand): Promise<GetAllAutoresResult> {
        const response = await this.autorRepository.getAllAutores({
            session: command.session
        });

        return {
            autores: response.autores,
            total: response.total
        };
    }

}
