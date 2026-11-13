import { type Session } from "@/domain/entities/session";

export interface PagarMultaReq {
    session: Session;
    id: string;
    fechaPago?: string | null;
}
