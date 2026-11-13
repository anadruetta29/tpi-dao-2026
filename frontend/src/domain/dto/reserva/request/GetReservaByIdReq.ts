import { type Session } from "@/domain/entities/session";

export interface GetReservaByIdReq {
    id: string;
    session: Session;
}
