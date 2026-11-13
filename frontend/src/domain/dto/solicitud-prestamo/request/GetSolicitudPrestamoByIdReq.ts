import { type Session } from "@/domain/entities/session";

export interface GetSolicitudPrestamoByIdReq {
    id: string;
    session: Session;
}
