import { type Session } from "@/domain/entities/session";
import { type SocioRepositoryI } from "@/domain/repositories/socio";
import { type Multa } from "@/domain/entities/multa";

export interface GetSocioMultasCommand {
    id: string;
    session: Session;
}

export interface GetSocioMultasResult {
    multas: Multa[];
}

export class GetSocioMultasUseCase {

    private readonly socioRepository: SocioRepositoryI;

    constructor(socioRepository: SocioRepositoryI) {
        this.socioRepository = socioRepository;
    }

    public async execute(command: GetSocioMultasCommand): Promise<GetSocioMultasResult> {
        const response = await this.socioRepository.getSocioMultas({
            id: command.id,
            session: command.session
        });

        return { multas: response.multas };
    }

}
