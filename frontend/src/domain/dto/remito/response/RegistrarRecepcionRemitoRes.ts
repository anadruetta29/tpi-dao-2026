import { Remito } from "@/domain/entities/remito";

export interface RegistrarRecepcionRemitoRes {
    id: string;
    remito?: Remito | null;
}
