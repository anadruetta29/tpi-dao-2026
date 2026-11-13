import { MultaRepositoryI } from "../../repositories/multa";
import { type Session } from "../../entities/session";
import { Multa } from "../../entities/multa";

export interface AnularMultaCommand {
    session: Session;
    id: string;
}

export interface AnularMultaResult {
    id: string;
    multa?: Multa | null;
}

export class AnularMultaUseCase {

    private readonly multaRepository: MultaRepositoryI;

    constructor(multaRepository: MultaRepositoryI) {
        this.multaRepository = multaRepository;
    }

    public async execute(command: AnularMultaCommand): Promise<AnularMultaResult> {
        const response = await this.multaRepository.anularMulta({
            session: command.session,
            id: command.id
        });

        return {
            id: response.id,
            multa: response.multa
        };
    }

}
