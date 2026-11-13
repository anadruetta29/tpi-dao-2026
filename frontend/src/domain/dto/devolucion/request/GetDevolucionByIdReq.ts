import { type Session } from "@/domain/entities/session";

export interface GetDevolucionByIdReq {
    id: string;
    session: Session;
}
