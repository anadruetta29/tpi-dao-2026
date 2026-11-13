import { Libro } from "@/domain/entities/libro";

export interface CreateLibroRes {
    id: string;
    libro?: Libro | null;
}
