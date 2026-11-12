import { BaseEntity } from "./base-entity";

export class EstadoSede extends BaseEntity {
    public static readonly ACTIVA = new EstadoSede("ACTIVA", "Activa");
    public static readonly BAJA = new EstadoSede("BAJA", "Baja");

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

    public static values(): EstadoSede[] {
        return [
            EstadoSede.ACTIVA,
            EstadoSede.BAJA
        ];
    }

    public static fromString(value?: string | null): EstadoSede {
        if (!value) return EstadoSede.ACTIVA;
        const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
        const found = EstadoSede.values().find(
            (s) => s.value === normalized || s.name.toUpperCase() === normalized
        );
        return found || EstadoSede.ACTIVA;
    }

    public static fromObject(obj: any): EstadoSede {
        if (!obj) return EstadoSede.ACTIVA;
        if (typeof obj === "string") return EstadoSede.fromString(obj);
        return EstadoSede.fromString(obj.value || obj.name);
    }

    public toOption(): { value: string; label: string } {
        return {
            value: this.value,
            label: this.name
        };
    }

    public static toOptions(): Array<{ value: string; label: string }> {
        return EstadoSede.values().map((status) => status.toOption());
    }

}
