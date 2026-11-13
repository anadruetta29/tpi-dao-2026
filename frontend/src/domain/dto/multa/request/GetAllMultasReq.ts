import { type Session } from "@/domain/entities/session";
import { EstadoMulta } from "@/domain/entities/estado-multa";
import { type MultaFilters } from "@/domain/filters/multa-filters";

export interface GetAllMultasReq {
    session: Session;
    socio_id?: string | null;
    estado?: string | EstadoMulta | null;
    filters?: MultaFilters;
}
