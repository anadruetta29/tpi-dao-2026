import { type Session } from "@/domain/entities/session";

export interface RegistrarRecepcionRemitoReq {
    session: Session;
    id: string;
    fechaRecepcion?: string | null;
    conIncidencia?: boolean;
}
