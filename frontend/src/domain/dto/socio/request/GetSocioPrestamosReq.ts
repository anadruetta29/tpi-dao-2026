import { type Session } from "@/domain/entities/session";

export interface GetSocioPrestamosReq {
    id: string;
    session: Session;
}
