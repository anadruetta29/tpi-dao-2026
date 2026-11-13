import { type Session } from "@/domain/entities/session";

export interface GetSocioMultasReq {
    id: string;
    session: Session;
}
