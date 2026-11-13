import { Prestamo } from "@/domain/entities/prestamo";

export interface GetAllPrestamosRes {
    prestamos: Prestamo[];
    total: number;
}
