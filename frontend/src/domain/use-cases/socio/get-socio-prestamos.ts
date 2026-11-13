import { type Session } from "@/domain/entities/session";
import { type SocioRepositoryI } from "@/domain/repositories/socio";
import { type Prestamo } from "@/domain/entities/prestamo";

export interface GetSocioPrestamosCommand {
    id: string;
    session: Session;
}

export interface GetSocioPrestamosResult {
    prestamos: Prestamo[];
}

export class GetSocioPrestamosUseCase {

    private readonly socioRepository: SocioRepositoryI;

    constructor(socioRepository: SocioRepositoryI) {
        this.socioRepository = socioRepository;
    }

    public async execute(command: GetSocioPrestamosCommand): Promise<GetSocioPrestamosResult> {
        const response = await this.socioRepository.getSocioPrestamos({
            id: command.id,
            session: command.session
        });

        return { prestamos: response.prestamos };
    }

}
