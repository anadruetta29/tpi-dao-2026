import { type Session } from "@/domain/entities/session";

export interface GetAllDevolucionesReq {
    session: Session;
    prestamoId?: string;
    socioId?: string;
    estadoDevuelto?: string;
}
