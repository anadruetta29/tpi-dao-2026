import { EstadoPrestamo } from "@/domain/entities/estado-prestamo";

export class PrestamoFilters {

    constructor(
        public socio_id?: string | null,
        public sede_id?: string | null,
        public estado?: string | EstadoPrestamo | null
    ) {}

    public static fromObject(obj: any): PrestamoFilters {
        if (!obj) return new PrestamoFilters();

        const rawSocioId = obj.filters?.socio_id ?? obj.socio_id;
        const rawSedeId = obj.filters?.sede_id ?? obj.sede_id;
        const rawEstado = obj.filters?.estado ?? obj.estado;

        const estadoValue = rawEstado instanceof EstadoPrestamo
            ? rawEstado.value
            : (typeof rawEstado === "string" && rawEstado.trim() ? rawEstado.trim() : null);

        return new PrestamoFilters(
            rawSocioId !== undefined && rawSocioId !== null && String(rawSocioId).trim() ? String(rawSocioId).trim() : null,
            rawSedeId !== undefined && rawSedeId !== null && String(rawSedeId).trim() ? String(rawSedeId).trim() : null,
            estadoValue
        );
    }

    public toApiParams(): Record<string, any> {
        const params: Record<string, any> = {};

        if (this.socio_id) params.socio_id = this.socio_id;
        if (this.sede_id) params.sede_id = this.sede_id;
        if (this.estado) {
            params.estado = this.estado instanceof EstadoPrestamo ? this.estado.value : this.estado;
        }

        return params;
    }

}
