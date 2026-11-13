import { type Session } from "@/domain/entities/session";

export interface GetRemitoByIdReq {
    session: Session;
    id: string;
}
