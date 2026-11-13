import { type EstadoSede } from "@/domain/entities/estado-sede";
import { type Session } from "@/domain/entities/session";

export interface GetAllSedesReq {
    estado?: EstadoSede;
    session: Session;
}
