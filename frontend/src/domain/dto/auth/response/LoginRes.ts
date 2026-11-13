import { Usuario } from "@/domain/entities/usuario";

export interface LoginRes {
    accessToken: string;
    user: Usuario;
}
