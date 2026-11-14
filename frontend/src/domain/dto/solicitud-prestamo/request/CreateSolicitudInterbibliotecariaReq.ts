import { type Session } from "@/domain/entities/session";

export interface CreateSolicitudInterbibliotecariaReq {
    recepcionistaId: string;
    ejemplarId: string;
    sedeOrigenId: string;
    sedeDestinoId: string;
    session: Session;
}
