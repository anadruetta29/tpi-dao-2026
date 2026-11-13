import { Libro } from "@/domain/entities/libro";

export interface GetAllLibrosRes {
    libros: Libro[];
    total: number;
}
