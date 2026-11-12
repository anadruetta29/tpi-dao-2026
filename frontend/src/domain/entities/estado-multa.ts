import { BaseEntity } from "./base-entity";

export class EstadoMulta extends BaseEntity {
    public static readonly PENDIENTE = new EstadoMulta("PENDIENTE", "Pendiente");
    public static readonly PAGADA = new EstadoMulta("PAGADA", "Pagada");
    public static readonly ANULADA = new EstadoMulta("ANULADA", "Anulada");

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

    public static values(): EstadoMulta[] {
        return [
            EstadoMulta.PENDIENTE,
            EstadoMulta.PAGADA,
            EstadoMulta.ANULADA
        ];
    }

    public static fromString(value?: string | null): EstadoMulta {
        if (!value) return EstadoMulta.PENDIENTE;
        const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
        const found = EstadoMulta.values().find(
            (s) => s.value === normalized || s.name.toUpperCase() === normalized
        );
        return found || EstadoMulta.PENDIENTE;
    }

    public static fromObject(obj: any): EstadoMulta {
        if (!obj) return EstadoMulta.PENDIENTE;
        if (typeof obj === "string") return EstadoMulta.fromString(obj);
        return EstadoMulta.fromString(obj.value || obj.name);
    }

    public toOption(): { value: string; label: string } {
        return {
            value: this.value,
            label: this.name
        };
    }

    public static toOptions(): Array<{ value: string; label: string }> {
        return EstadoMulta.values().map((status) => status.toOption());
    }

}
