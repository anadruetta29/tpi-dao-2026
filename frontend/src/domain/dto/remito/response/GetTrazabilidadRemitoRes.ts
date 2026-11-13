import { HistorialEstadoRemito } from "@/domain/entities/historial-estado-remito";

export interface GetTrazabilidadRemitoRes {
    remitoId: string;
    historial: HistorialEstadoRemito[];
}
