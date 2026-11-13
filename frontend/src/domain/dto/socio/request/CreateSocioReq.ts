import { type Session } from "@/domain/entities/session";

export interface CreateSocioReq {
    nombre: string;
    apellido: string;
    documento: string;
    email: string;
    telefono: string;
    session: Session;
}
