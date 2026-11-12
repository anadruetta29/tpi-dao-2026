import { Session } from "@/domain/entities/session";
import { Rol } from "@/domain/entities/rol";

export interface CreateUsuarioReq {
    session: Session;
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    role: Rol | string;
    activo?: boolean;
}
