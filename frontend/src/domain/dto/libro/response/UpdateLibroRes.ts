import { Libro } from "@/domain/entities/libro";

export interface UpdateLibroRes {
    id: string;
    libro?: Libro | null;
}
