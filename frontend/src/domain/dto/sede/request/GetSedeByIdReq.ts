import { type Session } from "@/domain/entities/session";

export interface GetSedeByIdReq {
    id: string;
    session: Session;
}
