import { BaseEntity } from "./base-entity";

export class EstadoReserva extends BaseEntity {
    public static readonly ACTIVA = new EstadoReserva("ACTIVA", "Activa");
    public static readonly ATENDIDA = new EstadoReserva("ATENDIDA", "Atendida");
    public static readonly CANCELADA = new EstadoReserva("CANCELADA", "Cancelada");
    public static readonly VENCIDA = new EstadoReserva("VENCIDA", "Vencida");

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

    public static values(): EstadoReserva[] {
        return [
            EstadoReserva.ACTIVA,
            EstadoReserva.ATENDIDA,
            EstadoReserva.CANCELADA,
            EstadoReserva.VENCIDA
        ];
    }

    public static fromString(value?: string | null): EstadoReserva {
        if (!value) return EstadoReserva.ACTIVA;
        const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
        const found = EstadoReserva.values().find(
            (s) => s.value === normalized || s.name.toUpperCase() === normalized
        );
        return found || EstadoReserva.ACTIVA;
    }

    public static fromObject(obj: any): EstadoReserva {
        if (!obj) return EstadoReserva.ACTIVA;
        if (typeof obj === "string") return EstadoReserva.fromString(obj);
        return EstadoReserva.fromString(obj.value || obj.name);
    }

    public toOption(): { value: string; label: string } {
        return {
            value: this.value,
            label: this.name
        };
    }

    public static toOptions(): Array<{ value: string; label: string }> {
        return EstadoReserva.values().map((status) => status.toOption());
    }

}
