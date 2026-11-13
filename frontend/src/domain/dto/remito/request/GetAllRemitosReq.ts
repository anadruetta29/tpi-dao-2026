import { type Session } from "@/domain/entities/session";
import { EstadoEnvio } from "@/domain/entities/estado-envio";
import { type RemitoFilters } from "@/domain/filters/remito-filters";

export interface GetAllRemitosReq {
    session: Session;
    sede_origen_id?: string | null;
    sede_destino_id?: string | null;
    estado?: string | EstadoEnvio | null;
    filters?: RemitoFilters;
}
