import { type MotivoMulta } from "@/domain/entities/motivo-multa";
import { type Session } from "@/domain/entities/session";

export interface UpdateTarifaMultaReq {
    session: Session;
    motivo: MotivoMulta | string;
    monto: number;
}
