import { type Session } from "@/domain/entities/session";

export interface CancelarPrestamoReq {
    id: string;
    session: Session;
}
