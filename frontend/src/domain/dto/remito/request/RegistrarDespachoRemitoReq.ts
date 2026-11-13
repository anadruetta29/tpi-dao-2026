import { type Session } from "@/domain/entities/session";

export interface RegistrarDespachoRemitoReq {
    session: Session;
    id: string;
    fechaDespacho?: string | null;
}
