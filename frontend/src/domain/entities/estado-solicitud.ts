import { BaseEntity } from "./base-entity";

export class EstadoSolicitud extends BaseEntity {
    public static readonly PENDIENTE = new EstadoSolicitud("PENDIENTE", "Pendiente");
    public static readonly APROBADA = new EstadoSolicitud("APROBADA", "Aprobada");
    public static readonly RECHAZADA = new EstadoSolicitud("RECHAZADA", "Rechazada");
    public static readonly CANCELADA = new EstadoSolicitud("CANCELADA", "Cancelada");

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

    public static values(): EstadoSolicitud[] {
        return [
            EstadoSolicitud.PENDIENTE,
            EstadoSolicitud.APROBADA,
            EstadoSolicitud.RECHAZADA,
            EstadoSolicitud.CANCELADA
        ];
    }

    public static fromString(value?: string | null): EstadoSolicitud {
        if (!value) return EstadoSolicitud.PENDIENTE;
        const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
        const found = EstadoSolicitud.values().find(
            (s) => s.value === normalized || s.name.toUpperCase() === normalized
        );
        return found || EstadoSolicitud.PENDIENTE;
    }

    public static fromObject(obj: any): EstadoSolicitud {
        if (!obj) return EstadoSolicitud.PENDIENTE;
        if (typeof obj === "string") return EstadoSolicitud.fromString(obj);
        return EstadoSolicitud.fromString(obj.value || obj.name);
    }

    public toOption(): { value: string; label: string } {
        return {
            value: this.value,
            label: this.name
        };
    }

    public static toOptions(): Array<{ value: string; label: string }> {
        return EstadoSolicitud.values().map((status) => status.toOption());
    }

}
