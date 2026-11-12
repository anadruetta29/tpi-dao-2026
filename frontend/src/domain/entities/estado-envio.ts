import { BaseEntity } from "./base-entity";

export class EstadoEnvio extends BaseEntity {
    public static readonly PENDIENTE = new EstadoEnvio("PENDIENTE", "Pendiente");
    public static readonly EMPACADO = new EstadoEnvio("EMPACADO", "Empacado");
    public static readonly DESPACHADO = new EstadoEnvio("DESPACHADO", "Despachado");
    public static readonly EN_TRANSITO = new EstadoEnvio("EN_TRANSITO", "En tránsito");
    public static readonly RECIBIDO = new EstadoEnvio("RECIBIDO", "Recibido");
    public static readonly CON_INCIDENCIA = new EstadoEnvio("CON_INCIDENCIA", "Con incidencia");

    // ======== Constructor ======== //

    private constructor(
        public readonly value: string,
        public readonly name: string
    ) {
        super();
    }

    // ======== Custom Getters ======== //

    public getValue(): string {
        return this.value;
    }

    public getName(): string {
        return this.name;
    }

    // ======== Static Factories & Methods ======== //

    public static values(): EstadoEnvio[] {
        return [
            EstadoEnvio.PENDIENTE,
            EstadoEnvio.EMPACADO,
            EstadoEnvio.DESPACHADO,
            EstadoEnvio.EN_TRANSITO,
            EstadoEnvio.RECIBIDO,
            EstadoEnvio.CON_INCIDENCIA
        ];
    }

    public static fromString(value?: string | null): EstadoEnvio {
        if (!value) return EstadoEnvio.PENDIENTE;
        const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
        const found = EstadoEnvio.values().find(
            (s) => s.value === normalized || s.name.toUpperCase() === normalized
        );
        return found || EstadoEnvio.PENDIENTE;
    }

    public static fromObject(obj: any): EstadoEnvio {
        if (!obj) return EstadoEnvio.PENDIENTE;
        if (typeof obj === "string") return EstadoEnvio.fromString(obj);
        return EstadoEnvio.fromString(obj.value || obj.name);
    }

    public toOption(): { value: string; label: string } {
        return {
            value: this.value,
            label: this.name
        };
    }

    public static toOptions(): Array<{ value: string; label: string }> {
        return EstadoEnvio.values().map((status) => status.toOption());
    }

}
