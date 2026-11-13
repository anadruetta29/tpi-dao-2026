import { type Session } from "@/domain/entities/session";
import { type EstadoSolicitud } from "@/domain/entities/estado-solicitud";

export interface UpdateSolicitudEstadoReq {
    id: string;
    estado: EstadoSolicitud;
    session: Session;
}
