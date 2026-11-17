import { Session } from "@/domain/entities/session";

export interface UpdateAutorReq {
    session: Session;
    id: string;
    nombre: string;
    apellido: string;
}
