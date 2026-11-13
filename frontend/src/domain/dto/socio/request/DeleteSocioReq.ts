import { type Session } from "@/domain/entities/session";

export interface DeleteSocioReq {
    id: string;
    session: Session;
}
