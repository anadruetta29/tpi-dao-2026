import { BaseEntity } from "./base-entity";

export class EstadoEjemplar extends BaseEntity {
    public static readonly DISPONIBLE = new EstadoEjemplar("DISPONIBLE", "Disponible");
    public static readonly PRESTADO = new EstadoEjemplar("PRESTADO", "Prestado");
    public static readonly RESERVADO = new EstadoEjemplar("RESERVADO", "Reservado");
    public static readonly EN_TRANSITO = new EstadoEjemplar("EN_TRANSITO", "En tránsito");
    public static readonly EN_REVISION = new EstadoEjemplar("EN_REVISION", "En revisión");
    public static readonly DANADO = new EstadoEjemplar("DANADO", "Dañado");
    public static readonly EXTRAVIADO = new EstadoEjemplar("EXTRAVIADO", "Extraviado");
    public static readonly DESTRUIDO = new EstadoEjemplar("DESTRUIDO", "Destruido");

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

    public static values(): EstadoEjemplar[] {
        return [
            EstadoEjemplar.DISPONIBLE,
            EstadoEjemplar.PRESTADO,
            EstadoEjemplar.RESERVADO,
            EstadoEjemplar.EN_TRANSITO,
            EstadoEjemplar.EN_REVISION,
            EstadoEjemplar.DANADO,
            EstadoEjemplar.EXTRAVIADO,
            EstadoEjemplar.DESTRUIDO
        ];
    }

    public static fromString(value?: string | null): EstadoEjemplar {
        if (!value) return EstadoEjemplar.DISPONIBLE;
        const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
        const found = EstadoEjemplar.values().find(
            (s) => s.value === normalized || s.name.toUpperCase() === normalized
        );
        return found || EstadoEjemplar.DISPONIBLE;
    }

    public static fromObject(obj: any): EstadoEjemplar {
        if (!obj) return EstadoEjemplar.DISPONIBLE;
        if (typeof obj === "string") return EstadoEjemplar.fromString(obj);
        return EstadoEjemplar.fromString(obj.value || obj.name);
    }

    public toOption(): { value: string; label: string } {
        return {
            value: this.value,
            label: this.name
        };
    }

    public static toOptions(): Array<{ value: string; label: string }> {
        return EstadoEjemplar.values().map((status) => status.toOption());
    }

}
