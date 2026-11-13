import { Session } from "@/domain/entities/session";

export interface GetLibroByIdReq {
    session: Session;
    id: string;
}
