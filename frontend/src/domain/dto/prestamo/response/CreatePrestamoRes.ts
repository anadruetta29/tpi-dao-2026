import { Prestamo } from "@/domain/entities/prestamo";

export interface CreatePrestamoRes {
    id: string;
    prestamo?: Prestamo | null;
}
