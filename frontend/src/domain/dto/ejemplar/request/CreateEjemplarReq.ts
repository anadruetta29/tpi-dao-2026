import { Session } from "@/domain/entities/session";
import { EstadoEjemplar } from "@/domain/entities/estado-ejemplar";

export interface CreateEjemplarReq {
    session: Session;
    codigo: string;
    libro_id: string;
    sede_id: string;
    estado?: EstadoEjemplar | string;
}
