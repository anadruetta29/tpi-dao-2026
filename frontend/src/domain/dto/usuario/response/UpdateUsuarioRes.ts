import { Usuario } from "@/domain/entities/usuario";

export interface UpdateUsuarioRes {
    id: string;
    usuario?: Usuario | null;
}
