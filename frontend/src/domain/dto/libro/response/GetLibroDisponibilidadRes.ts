import { Ejemplar } from "@/domain/entities/ejemplar";
import { Sede } from "@/domain/entities/sede";

export interface LibroDisponibilidadSedeItem {
    sedeId: string;
    sedeNombre: string;
    sede?: Sede | null;
    ejemplares: Ejemplar[];
}

export interface GetLibroDisponibilidadRes {
    libroId: string;
    sedes: LibroDisponibilidadSedeItem[];
}
