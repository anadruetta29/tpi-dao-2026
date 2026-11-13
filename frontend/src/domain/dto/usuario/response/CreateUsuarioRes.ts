import { Usuario } from "@/domain/entities/usuario";

export interface CreateUsuarioRes {
    id: string;
    usuario?: Usuario | null;
}
