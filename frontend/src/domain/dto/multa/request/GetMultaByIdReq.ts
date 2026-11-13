import { type Session } from "@/domain/entities/session";

export interface GetMultaByIdReq {
    session: Session;
    id: string;
}
