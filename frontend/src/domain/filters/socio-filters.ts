import { type EstadoSocio } from "@/domain/entities/estado-socio";

export class SocioFilters {

    constructor(
        public q?: string,
        public documento?: string,
        public estado?: EstadoSocio
    ) {}

    public toApiParams(): Record<string, string | undefined> {
        return {
            q: this.q?.trim(),
            documento: this.documento?.trim(),
            estado: this.estado?.getValue()
        };
    }

}
