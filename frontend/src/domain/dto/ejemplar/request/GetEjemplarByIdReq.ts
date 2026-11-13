import { Session } from "@/domain/entities/session";

export interface GetEjemplarByIdReq {
    session: Session;
    id: string;
}
