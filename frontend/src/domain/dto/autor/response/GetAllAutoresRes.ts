import { Autor } from "@/domain/entities/autor";

export interface GetAllAutoresRes {
    autores: Autor[];
    total: number;
}
