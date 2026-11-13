import { type Session } from "@/domain/entities/session";
import { type TipoPrestamo } from "@/domain/entities/tipo-prestamo";
import { type EstadoSolicitud } from "@/domain/entities/estado-solicitud";
import { type SolicitudPrestamoRepositoryI } from "@/domain/repositories/solicitud-prestamo";
import { type SolicitudPrestamo } from "@/domain/entities/solicitud-prestamo";

export interface GetAllSolicitudesPrestamoCommand {
    tipo?: TipoPrestamo;
    estado?: EstadoSolicitud;
    sedeId?: string;
    session: Session;
}

export interface GetAllSolicitudesPrestamoResult {
    solicitudes: SolicitudPrestamo[];
}

export class GetAllSolicitudesPrestamoUseCase {

    private readonly solicitudPrestamoRepository: SolicitudPrestamoRepositoryI;

    constructor(solicitudPrestamoRepository: SolicitudPrestamoRepositoryI) {
        this.solicitudPrestamoRepository = solicitudPrestamoRepository;
    }

    public async execute(command: GetAllSolicitudesPrestamoCommand): Promise<GetAllSolicitudesPrestamoResult> {
        const response = await this.solicitudPrestamoRepository.getAllSolicitudesPrestamo({
            tipo: command.tipo,
            estado: command.estado,
            sedeId: command.sedeId,
            session: command.session
        });

        return { solicitudes: response.solicitudes };
    }

}
