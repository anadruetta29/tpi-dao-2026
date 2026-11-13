import { Ejemplar } from "@/domain/entities/ejemplar";

export interface CreateEjemplarRes {
    id: string;
    ejemplar?: Ejemplar | null;
}
