import { type Session } from "@/domain/entities/session";
import { type SocioRepositoryI } from "@/domain/repositories/socio";
import { type Socio } from "@/domain/entities/socio";

export interface GetSocioByIdCommand {
    id: string;
    session: Session;
}

export interface GetSocioByIdResult {
    socio: Socio;
}

export class GetSocioByIdUseCase {

    private readonly socioRepository: SocioRepositoryI;

    constructor(socioRepository: SocioRepositoryI) {
        this.socioRepository = socioRepository;
    }

    public async execute(command: GetSocioByIdCommand): Promise<GetSocioByIdResult> {
        const response = await this.socioRepository.getSocioById({
            id: command.id,
            session: command.session
        });

        return { socio: response.socio };
    }

}
