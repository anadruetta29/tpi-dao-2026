import { type Session } from "@/domain/entities/session";
import { type SolicitudPrestamoRepositoryI } from "@/domain/repositories/solicitud-prestamo";
import { type SolicitudPrestamo } from "@/domain/entities/solicitud-prestamo";

export interface CreateSolicitudInterbibliotecariaCommand {
    recepcionistaId?: string;
    ejemplarId?: string;
    ejemplaresIds?: string[];
    sedeOrigenId: string;
    sedeDestinoId: string;
    session: Session;
}

export interface CreateSolicitudInterbibliotecariaResult {
    solicitud: SolicitudPrestamo;
}

export class CreateSolicitudInterbibliotecariaUseCase {

    private readonly solicitudPrestamoRepository: SolicitudPrestamoRepositoryI;

    constructor(solicitudPrestamoRepository: SolicitudPrestamoRepositoryI) {
        this.solicitudPrestamoRepository = solicitudPrestamoRepository;
    }

    public async execute(command: CreateSolicitudInterbibliotecariaCommand): Promise<CreateSolicitudInterbibliotecariaResult> {
        const response = await this.solicitudPrestamoRepository.createSolicitudInterbibliotecaria({
            recepcionistaId: command.recepcionistaId || undefined,
            ejemplarId: command.ejemplarId,
            ejemplaresIds: command.ejemplaresIds,
            sedeOrigenId: command.sedeOrigenId,
            sedeDestinoId: command.sedeDestinoId,
            session: command.session
        });

        return { solicitud: response.solicitud };
    }

}
