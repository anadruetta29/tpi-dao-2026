import { type Session } from "@/domain/entities/session";
import { EstadoPrestamo } from "@/domain/entities/estado-prestamo";
import { type PrestamoFilters } from "@/domain/filters/prestamo-filters";

export interface GetAllPrestamosReq {
    session: Session;
    socio_id?: string | null;
    sede_id?: string | null;
    estado?: string | EstadoPrestamo | null;
    filters?: PrestamoFilters;
}
