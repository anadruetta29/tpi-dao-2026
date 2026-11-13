import { type Session } from "@/domain/entities/session";

export interface AnularMultaReq {
    session: Session;
    id: string;
}
