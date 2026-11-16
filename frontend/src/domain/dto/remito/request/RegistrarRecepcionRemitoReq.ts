import { type Session } from "@/domain/entities/session";

export interface RegistrarRecepcionRemitoReq {
    session: Session;
    id: string;
    fechaRecepcion?: string | null;
    conIncidencia?: boolean;
    incidencias?: { ejemplar_id: number; estado: string; observacion: string }[];
}
