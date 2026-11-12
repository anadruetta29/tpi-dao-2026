import { Session } from "@/domain/entities/session";
import { Rol } from "@/domain/entities/rol";

export interface UpdateUsuarioReq {
    session: Session;
    id: string;
    nombre?: string;
    apellido?: string;
    email?: string;
    password?: string;
    activo?: boolean;
    role?: Rol | string;
}
