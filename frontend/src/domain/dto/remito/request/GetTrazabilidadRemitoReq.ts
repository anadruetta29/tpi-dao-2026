import { type Session } from "@/domain/entities/session";

export interface GetTrazabilidadRemitoReq {
    session: Session;
    id: string;
}
