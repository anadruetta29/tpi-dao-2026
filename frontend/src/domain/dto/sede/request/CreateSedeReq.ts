import { type Session } from "@/domain/entities/session";

export interface CreateSedeReq {
    nombre: string;
    telefono: string;
    email: string;
    horarioAtencion: string;
    session: Session;
}
