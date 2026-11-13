import { type Session } from "@/domain/entities/session";

export interface GetSocioByIdReq {
    id: string;
    session: Session;
}
