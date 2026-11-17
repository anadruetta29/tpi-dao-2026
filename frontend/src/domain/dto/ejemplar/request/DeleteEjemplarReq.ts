import { Session } from "@/domain/entities/session";

export interface DeleteEjemplarReq {
    session: Session;
    id: string;
}
