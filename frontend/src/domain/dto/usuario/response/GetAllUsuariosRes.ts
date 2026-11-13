import { Usuario } from "@/domain/entities/usuario";

export interface GetAllUsuariosRes {
    usuarios: Usuario[];
    total: number;
}
