import { Remito } from "@/domain/entities/remito";

export interface RegistrarDespachoRemitoRes {
    id: string;
    remito?: Remito | null;
}
