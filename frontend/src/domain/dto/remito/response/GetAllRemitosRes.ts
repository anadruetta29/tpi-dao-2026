import { Remito } from "@/domain/entities/remito";

export interface GetAllRemitosRes {
    remitos: Remito[];
    total: number;
}
