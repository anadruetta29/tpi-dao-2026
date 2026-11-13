import { type Session } from "@/domain/entities/session";

export interface CreateReservaReq {
    socioId: string;
    libroId?: string;
    ejemplarId?: string;
    sedeId?: string;
    fecha?: string;
    session: Session;
}
