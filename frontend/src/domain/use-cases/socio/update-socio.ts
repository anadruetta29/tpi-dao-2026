import { type Session } from "@/domain/entities/session";
import { type SocioRepositoryI } from "@/domain/repositories/socio";
import { type Socio } from "@/domain/entities/socio";

export interface UpdateSocioCommand {
    id: string;
    nombre: string;
    apellido: string;
    documento: string;
    email: string;
    telefono: string;
    session: Session;
}

export interface UpdateSocioResult {
    socio: Socio;
}

export class UpdateSocioUseCase {

    private readonly socioRepository: SocioRepositoryI;

    constructor(socioRepository: SocioRepositoryI) {
        this.socioRepository = socioRepository;
    }

    public async execute(command: UpdateSocioCommand): Promise<UpdateSocioResult> {
        const response = await this.socioRepository.updateSocio({
            id: command.id,
            nombre: command.nombre,
            apellido: command.apellido,
            documento: command.documento,
            email: command.email,
            telefono: command.telefono,
            session: command.session
        });

        return { socio: response.socio };
    }

}
