import { type Prestamo } from "@/domain/entities/prestamo";

export interface GetSocioPrestamosRes {
    prestamos: Prestamo[];
}
