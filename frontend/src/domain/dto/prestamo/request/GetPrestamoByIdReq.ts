import { type Session } from "@/domain/entities/session";

export interface GetPrestamoByIdReq {
    session: Session;
    id: string;
}
