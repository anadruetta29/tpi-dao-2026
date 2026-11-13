import { EstadoMulta } from "@/domain/entities/estado-multa";

export class MultaFilters {

    constructor(
        public socio_id?: string | null,
        public estado?: string | EstadoMulta | null
    ) {}

    public static fromObject(obj: any): MultaFilters {
        if (!obj) return new MultaFilters();

        const rawSocioId = obj.filters?.socio_id ?? obj.socio_id;
        const rawEstado = obj.filters?.estado ?? obj.estado;

        const estadoValue = rawEstado instanceof EstadoMulta
            ? rawEstado.value
            : (typeof rawEstado === "string" && rawEstado.trim() ? rawEstado.trim() : null);

        return new MultaFilters(
            rawSocioId !== undefined && rawSocioId !== null && String(rawSocioId).trim() ? String(rawSocioId).trim() : null,
            estadoValue
        );
    }

    public toApiParams(): Record<string, any> {
        const params: Record<string, any> = {};

        if (this.socio_id) params.socio_id = this.socio_id;
        if (this.estado) {
            params.estado = this.estado instanceof EstadoMulta ? this.estado.value : this.estado;
        }

        return params;
    }

}
