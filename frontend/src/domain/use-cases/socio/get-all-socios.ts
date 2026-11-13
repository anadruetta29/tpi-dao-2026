import { type Session } from "@/domain/entities/session";
import { type EstadoSocio } from "@/domain/entities/estado-socio";
import { type SocioRepositoryI } from "@/domain/repositories/socio";
import { type Socio } from "@/domain/entities/socio";

export interface GetAllSociosCommand {
    q?: string;
    documento?: string;
    estado?: EstadoSocio;
    session: Session;
}

export interface GetAllSociosResult {
    socios: Socio[];
}

export class GetAllSociosUseCase {

    private readonly socioRepository: SocioRepositoryI;

    constructor(socioRepository: SocioRepositoryI) {
        this.socioRepository = socioRepository;
    }

    public async execute(command: GetAllSociosCommand): Promise<GetAllSociosResult> {
        const response = await this.socioRepository.getAllSocios({
            q: command.q,
            documento: command.documento,
            estado: command.estado,
            session: command.session
        });

        return { socios: response.socios };
    }

}
