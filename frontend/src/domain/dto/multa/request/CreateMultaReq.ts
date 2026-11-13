import { type Session } from "@/domain/entities/session";
import { MotivoMulta } from "@/domain/entities/motivo-multa";
import { EstadoMulta } from "@/domain/entities/estado-multa";

export interface CreateMultaReq {
    session: Session;
    socio_id: string;
    prestamo_id: string;
    motivo: MotivoMulta | string;
    monto: number;
    estado?: EstadoMulta | string;
}
