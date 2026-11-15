import { type Remito } from "@/domain/entities/remito";

export interface RegistrarEmpaqueRemitoRes {
    id: string;
    remito?: Remito | null;
}
