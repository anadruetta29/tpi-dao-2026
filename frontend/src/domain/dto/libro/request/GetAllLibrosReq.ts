import { Session } from "@/domain/entities/session";
import { LibroFilters } from "@/domain/filters/libro-filters";

export interface GetAllLibrosReq {
    session: Session;
    titulo?: string | null;
    autor?: string | null;
    editorial?: string | null;
    filters?: LibroFilters;
}
