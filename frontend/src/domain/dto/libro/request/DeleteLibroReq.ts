import { Session } from "@/domain/entities/session";

export interface DeleteLibroReq {
    session: Session;
    id: string;
}
