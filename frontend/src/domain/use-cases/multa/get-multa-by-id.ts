import { MultaRepositoryI } from "../../repositories/multa";
import { type Session } from "../../entities/session";
import { Multa } from "../../entities/multa";

export interface GetMultaByIdCommand {
    session: Session;
    id: string;
}

export interface GetMultaByIdResult {
    multa: Multa;
}

export class GetMultaByIdUseCase {

    private readonly multaRepository: MultaRepositoryI;

    constructor(multaRepository: MultaRepositoryI) {
        this.multaRepository = multaRepository;
    }

    public async execute(command: GetMultaByIdCommand): Promise<GetMultaByIdResult> {
        const response = await this.multaRepository.getMultaById({
            session: command.session,
            id: command.id
        });

        return {
            multa: response.multa
        };
    }

}
