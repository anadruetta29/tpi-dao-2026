import { Session } from "@/domain/entities/session";
import { Rol } from "@/domain/entities/rol";
import { UsuarioFilters } from "@/domain/filters/usuario-filters";

export interface GetAllUsuariosReq {
    session: Session;
    role?: string | Rol | null;
    activo?: boolean | null;
    filters?: UsuarioFilters;
}
