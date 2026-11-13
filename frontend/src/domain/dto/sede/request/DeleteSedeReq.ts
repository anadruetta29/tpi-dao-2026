import { type Session } from "@/domain/entities/session";

export interface DeleteSedeReq {
    id: string;
    session: Session;
}
