import { type Session } from "@/domain/entities/session";

export interface CreateRemitoReq {
    session: Session;
    ejemplaresIds: string[];
    sede_origen_id?: string | null;
    sede_destino_id?: string | null;
    fechaEmision?: string | null;
}
