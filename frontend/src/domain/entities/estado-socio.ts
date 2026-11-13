import { BaseEntity } from "./base-entity";

export class EstadoSocio extends BaseEntity {
    public static readonly HABILITADO = new EstadoSocio("HABILITADO", "Habilitado");
    public static readonly INHABILITADO = new EstadoSocio("INHABILITADO", "Inhabilitado");

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

    public static values(): EstadoSocio[] {
        return [
            EstadoSocio.HABILITADO,
            EstadoSocio.INHABILITADO
        ];
    }

    public static fromString(value?: string | null): EstadoSocio {
        if (!value) return EstadoSocio.HABILITADO;
        const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
        const found = EstadoSocio.values().find(
            (s) => s.value === normalized || s.name.toUpperCase() === normalized
        );
        return found || EstadoSocio.HABILITADO;
    }

    public static fromObject(obj: any): EstadoSocio {
        if (!obj) return EstadoSocio.HABILITADO;
        if (typeof obj === "string") return EstadoSocio.fromString(obj);
        return EstadoSocio.fromString(obj.value || obj.name);
    }

    public toOption(): { value: string; label: string } {
        return {
            value: this.value,
            label: this.name
        };
    }

    public static toOptions(): Array<{ value: string; label: string }> {
        return EstadoSocio.values().map((status) => status.toOption());
    }

}
