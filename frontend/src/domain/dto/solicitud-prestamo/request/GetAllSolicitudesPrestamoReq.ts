import { type Session } from "@/domain/entities/session";
import { type TipoPrestamo } from "@/domain/entities/tipo-prestamo";
import { type EstadoSolicitud } from "@/domain/entities/estado-solicitud";

export interface GetAllSolicitudesPrestamoReq {
    tipo?: TipoPrestamo;
    estado?: EstadoSolicitud;
    sedeId?: string;
    session: Session;
}
