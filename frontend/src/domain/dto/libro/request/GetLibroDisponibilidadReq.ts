import { Session } from "@/domain/entities/session";

export interface GetLibroDisponibilidadReq {
    session: Session;
    id: string;
}
