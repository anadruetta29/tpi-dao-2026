import { type EstadoReserva } from "@/domain/entities/estado-reserva";

export class ReservaFilters {

    constructor(
        public libroId?: string,
        public socioId?: string,
        public sedeId?: string,
        public estado?: EstadoReserva
    ) {}

    public toApiParams(): Record<string, string | undefined> {
        return {
            libro_id: this.libroId?.trim(),
            socio_id: this.socioId?.trim(),
            sede_id: this.sedeId?.trim(),
            estado: this.estado?.getValue()
        };
    }

}
