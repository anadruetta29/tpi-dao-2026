import { type Session } from "@/domain/entities/session";
import { type SolicitudPrestamoRepositoryI } from "@/domain/repositories/solicitud-prestamo";
import { type SolicitudPrestamo } from "@/domain/entities/solicitud-prestamo";

export interface GetSolicitudPrestamoByIdCommand {
    id: string;
    session: Session;
}

export interface GetSolicitudPrestamoByIdResult {
    solicitud: SolicitudPrestamo;
}

export class GetSolicitudPrestamoByIdUseCase {

    private readonly solicitudPrestamoRepository: SolicitudPrestamoRepositoryI;

    constructor(solicitudPrestamoRepository: SolicitudPrestamoRepositoryI) {
        this.solicitudPrestamoRepository = solicitudPrestamoRepository;
    }

    public async execute(command: GetSolicitudPrestamoByIdCommand): Promise<GetSolicitudPrestamoByIdResult> {
        const response = await this.solicitudPrestamoRepository.getSolicitudPrestamoById({
            id: command.id,
            session: command.session
        });

        return { solicitud: response.solicitud };
    }

}
