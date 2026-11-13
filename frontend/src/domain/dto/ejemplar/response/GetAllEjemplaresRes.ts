import { Ejemplar } from "@/domain/entities/ejemplar";

export interface GetAllEjemplaresRes {
    ejemplares: Ejemplar[];
    total: number;
}
