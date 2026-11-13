import { Session } from "@/domain/entities/session";
import { EstadoEjemplar } from "@/domain/entities/estado-ejemplar";
import { EjemplarFilters } from "@/domain/filters/ejemplar-filters";

export interface GetAllEjemplaresReq {
    session: Session;
    libro_id?: string | null;
    sede_id?: string | null;
    estado?: string | EstadoEjemplar | null;
    filters?: EjemplarFilters;
}
