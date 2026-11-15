import { EstadoEjemplar } from "@/domain/entities/estado-ejemplar";
import { Session } from "@/domain/entities/session";

export interface UpdateEjemplarEstadoReq {
    session: Session;
    id: string;
    estado: EstadoEjemplar;
}
