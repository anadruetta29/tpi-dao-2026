import { type Session } from "@/domain/entities/session";

export interface UpdateSedeReq {
    id: string;
    nombre: string;
    telefono: string;
    email: string;
    horarioAtencion: string;
    session: Session;
}
