import { type Session } from "@/domain/entities/session";
import { type SocioRepositoryI } from "@/domain/repositories/socio";

export interface DeleteSocioCommand {
    id: string;
    session: Session;
}

export class DeleteSocioUseCase {

    private readonly socioRepository: SocioRepositoryI;

    constructor(socioRepository: SocioRepositoryI) {
        this.socioRepository = socioRepository;
    }

    public async execute(command: DeleteSocioCommand): Promise<void> {
        await this.socioRepository.deleteSocio({
            id: command.id,
            session: command.session
        });
    }

}
