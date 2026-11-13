import { type Session } from "@/domain/entities/session";
import { type SolicitudPrestamoRepositoryI } from "@/domain/repositories/solicitud-prestamo";
import { type SolicitudPrestamo } from "@/domain/entities/solicitud-prestamo";

export interface CreateSolicitudLocalCommand {
    socioId: string;
    ejemplarId: string;
    sedeOrigenId: string;
    session: Session;
}

export interface CreateSolicitudLocalResult {
    solicitud: SolicitudPrestamo;
}

export class CreateSolicitudLocalUseCase {

    private readonly solicitudPrestamoRepository: SolicitudPrestamoRepositoryI;

    constructor(solicitudPrestamoRepository: SolicitudPrestamoRepositoryI) {
        this.solicitudPrestamoRepository = solicitudPrestamoRepository;
    }

    public async execute(command: CreateSolicitudLocalCommand): Promise<CreateSolicitudLocalResult> {
        const response = await this.solicitudPrestamoRepository.createSolicitudLocal({
            socioId: command.socioId,
            ejemplarId: command.ejemplarId,
            sedeOrigenId: command.sedeOrigenId,
            session: command.session
        });

        return { solicitud: response.solicitud };
    }

}
