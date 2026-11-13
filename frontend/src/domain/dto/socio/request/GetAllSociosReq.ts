import { type Session } from "@/domain/entities/session";
import { type EstadoSocio } from "@/domain/entities/estado-socio";

export interface GetAllSociosReq {
    q?: string;
    documento?: string;
    estado?: EstadoSocio;
    session: Session;
}
