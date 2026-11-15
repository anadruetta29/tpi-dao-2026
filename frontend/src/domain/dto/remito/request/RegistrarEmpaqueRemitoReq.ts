import { type Session } from "@/domain/entities/session";

export interface RegistrarEmpaqueRemitoReq {
    session: Session;
    id: string;
}
