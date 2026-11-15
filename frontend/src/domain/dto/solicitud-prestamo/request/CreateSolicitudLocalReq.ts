import { type Session } from "@/domain/entities/session";

export interface CreateSolicitudLocalReq {
    socioId: string;
    ejemplarId?: string;
    ejemplaresIds?: string[];
    sedeOrigenId: string;
    session: Session;
}
