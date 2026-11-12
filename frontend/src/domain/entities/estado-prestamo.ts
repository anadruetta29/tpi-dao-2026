import { BaseEntity } from "./base-entity";

export class EstadoPrestamo extends BaseEntity {
    public static readonly ACTIVO = new EstadoPrestamo("ACTIVO", "Activo");
    public static readonly DEVUELTO = new EstadoPrestamo("DEVUELTO", "Devuelto");
    public static readonly VENCIDO = new EstadoPrestamo("VENCIDO", "Vencido");

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

    public static values(): EstadoPrestamo[] {
        return [
            EstadoPrestamo.ACTIVO,
            EstadoPrestamo.DEVUELTO,
            EstadoPrestamo.VENCIDO
        ];
    }

    public static fromString(value?: string | null): EstadoPrestamo {
        if (!value) return EstadoPrestamo.ACTIVO;
        const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
        const found = EstadoPrestamo.values().find(
            (s) => s.value === normalized || s.name.toUpperCase() === normalized
        );
        return found || EstadoPrestamo.ACTIVO;
    }

    public static fromObject(obj: any): EstadoPrestamo {
        if (!obj) return EstadoPrestamo.ACTIVO;
        if (typeof obj === "string") return EstadoPrestamo.fromString(obj);
        return EstadoPrestamo.fromString(obj.value || obj.name);
    }

    public toOption(): { value: string; label: string } {
        return {
            value: this.value,
            label: this.name
        };
    }

    public static toOptions(): Array<{ value: string; label: string }> {
        return EstadoPrestamo.values().map((status) => status.toOption());
    }

}
