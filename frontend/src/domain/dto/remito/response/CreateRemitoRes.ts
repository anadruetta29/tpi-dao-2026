import { Remito } from "@/domain/entities/remito";

export interface CreateRemitoRes {
    id: string;
    remito?: Remito | null;
}
