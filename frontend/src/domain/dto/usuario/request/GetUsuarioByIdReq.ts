import { Session } from "@/domain/entities/session";

export interface GetUsuarioByIdReq {
    session: Session;
    id: string;
}
