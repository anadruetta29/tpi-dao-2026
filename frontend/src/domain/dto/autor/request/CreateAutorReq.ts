import { Session } from "@/domain/entities/session";

export interface CreateAutorReq {
    session: Session;
    nombre: string;
    apellido: string;
}
