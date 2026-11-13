import { EstadoEjemplar } from "@/domain/entities/estado-ejemplar";

export class EjemplarFilters {

    constructor(
        public libro_id?: string | null,
        public sede_id?: string | null,
        public estado?: string | EstadoEjemplar | null
    ) {}

    public static fromObject(obj: any): EjemplarFilters {
        if (!obj) return new EjemplarFilters();

        const rawLibroId = obj.filters?.libro_id ?? obj.libro_id;
        const rawSedeId = obj.filters?.sede_id ?? obj.sede_id;
        const rawEstado = obj.filters?.estado ?? obj.estado;

        const estadoValue = rawEstado instanceof EstadoEjemplar
            ? rawEstado.value
            : (typeof rawEstado === "string" && rawEstado.trim() ? rawEstado.trim() : null);

        return new EjemplarFilters(
            rawLibroId !== undefined && rawLibroId !== null && String(rawLibroId).trim() ? String(rawLibroId).trim() : null,
            rawSedeId !== undefined && rawSedeId !== null && String(rawSedeId).trim() ? String(rawSedeId).trim() : null,
            estadoValue
        );
    }

    public toApiParams(): Record<string, any> {
        const params: Record<string, any> = {};

        if (this.libro_id) params.libro_id = this.libro_id;
        if (this.sede_id) params.sede_id = this.sede_id;
        if (this.estado) {
            params.estado = this.estado instanceof EstadoEjemplar ? this.estado.value : this.estado;
        }

        return params;
    }

}
