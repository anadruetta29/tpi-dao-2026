import { type Session } from "@/domain/entities/session";
import { type SocioRepositoryI } from "@/domain/repositories/socio";
import { type Socio } from "@/domain/entities/socio";

export interface CreateSocioCommand {
    nombre: string;
    apellido: string;
    documento: string;
    email: string;
    telefono: string;
    session: Session;
}

export interface CreateSocioResult {
    socio: Socio;
}

export class CreateSocioUseCase {

    private readonly socioRepository: SocioRepositoryI;

    constructor(socioRepository: SocioRepositoryI) {
        this.socioRepository = socioRepository;
    }

    public async execute(command: CreateSocioCommand): Promise<CreateSocioResult> {
        const response = await this.socioRepository.createSocio({
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
