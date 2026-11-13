import { type Session } from "@/domain/entities/session";

export interface CreateRemitoReq {
    session: Session;
    ejemplaresIds: string[];
    solicitud_id?: string | null;
    sede_origen_id?: string | null;
    sede_destino_id?: string | null;
    numero?: string | null;
    fechaEmision?: string | null;
}
