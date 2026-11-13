import { type Session } from "@/domain/entities/session";
import { type EstadoSolicitud } from "@/domain/entities/estado-solicitud";
import { type SolicitudPrestamoRepositoryI } from "@/domain/repositories/solicitud-prestamo";
import { type SolicitudPrestamo } from "@/domain/entities/solicitud-prestamo";

export interface UpdateSolicitudEstadoCommand {
    id: string;
    estado: EstadoSolicitud;
    session: Session;
}

export interface UpdateSolicitudEstadoResult {
    solicitud: SolicitudPrestamo;
}

export class UpdateSolicitudEstadoUseCase {

    private readonly solicitudPrestamoRepository: SolicitudPrestamoRepositoryI;

    constructor(solicitudPrestamoRepository: SolicitudPrestamoRepositoryI) {
        this.solicitudPrestamoRepository = solicitudPrestamoRepository;
    }

    public async execute(command: UpdateSolicitudEstadoCommand): Promise<UpdateSolicitudEstadoResult> {
        const response = await this.solicitudPrestamoRepository.updateSolicitudEstado({
            id: command.id,
            estado: command.estado,
            session: command.session
        });

        return { solicitud: response.solicitud };
    }

}
