import { Remito } from "@/domain/entities/remito";
import { Ejemplar } from "@/domain/entities/ejemplar";

export interface GetRemitoByIdRes {
    remito: Remito;
    ejemplares: Ejemplar[];
}
