import { EstadoEnvio } from "@/domain/entities/estado-envio";

export class RemitoFilters {

    constructor(
        public sede_origen_id?: string | null,
        public sede_destino_id?: string | null,
        public estado?: string | EstadoEnvio | null
    ) {}

    public static fromObject(obj: any): RemitoFilters {
        if (!obj) return new RemitoFilters();

        const rawOrigen = obj.filters?.sede_origen_id ?? obj.sede_origen_id;
        const rawDestino = obj.filters?.sede_destino_id ?? obj.sede_destino_id;
        const rawEstado = obj.filters?.estado ?? obj.estado;

        const estadoValue = rawEstado instanceof EstadoEnvio
            ? rawEstado.value
            : (typeof rawEstado === "string" && rawEstado.trim() ? rawEstado.trim() : null);

        return new RemitoFilters(
            rawOrigen !== undefined && rawOrigen !== null && String(rawOrigen).trim() ? String(rawOrigen).trim() : null,
            rawDestino !== undefined && rawDestino !== null && String(rawDestino).trim() ? String(rawDestino).trim() : null,
            estadoValue
        );
    }

    public toApiParams(): Record<string, any> {
        const params: Record<string, any> = {};

        if (this.sede_origen_id) params.sede_origen_id = this.sede_origen_id;
        if (this.sede_destino_id) params.sede_destino_id = this.sede_destino_id;
        if (this.estado) {
            params.estado = this.estado instanceof EstadoEnvio ? this.estado.value : this.estado;
        }

        return params;
    }

}
