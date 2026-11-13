import { type Session } from "@/domain/entities/session";

export interface CreateSolicitudLocalReq {
    socioId: string;
    ejemplarId: string;
    sedeOrigenId: string;
    session: Session;
}
