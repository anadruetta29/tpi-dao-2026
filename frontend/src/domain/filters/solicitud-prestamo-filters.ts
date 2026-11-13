import { type TipoPrestamo } from "@/domain/entities/tipo-prestamo";
import { type EstadoSolicitud } from "@/domain/entities/estado-solicitud";

export class SolicitudPrestamoFilters {

    constructor(
        public tipo?: TipoPrestamo,
        public estado?: EstadoSolicitud,
        public sedeId?: string
    ) {}

    public toApiParams(): Record<string, string | undefined> {
        return {
            tipo: this.tipo?.getValue(),
            estado: this.estado?.getValue(),
            sede_id: this.sedeId?.trim()
        };
    }

}
