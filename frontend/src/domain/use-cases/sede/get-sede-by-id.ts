import { SedeRepositoryI } from "../../repositories/sede";
import { type Sede } from "../../entities/sede";
import { type Session } from "../../entities/session";

export interface GetSedeByIdCommand {
    id: string;
    session: Session;
}

export interface GetSedeByIdResult {
    sede: Sede;
}

export class GetSedeByIdUseCase {

    private readonly sedeRepository: SedeRepositoryI;

    constructor(sedeRepository: SedeRepositoryI) {
        this.sedeRepository = sedeRepository;
    }

    public async execute(command: GetSedeByIdCommand): Promise<GetSedeByIdResult> {
        const response = await this.sedeRepository.getSedeById({
            id: command.id,
            session: command.session
        });
        return {
            sede: response.sede
        };
    }

}
