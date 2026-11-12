import { BaseEntity } from "./base-entity";

export class TipoPrestamo extends BaseEntity {
    public static readonly LOCAL = new TipoPrestamo("LOCAL", "Local");
    public static readonly INTERBIBLIOTECARIO = new TipoPrestamo("INTERBIBLIOTECARIO", "Interbibliotecario");

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

    public static values(): TipoPrestamo[] {
        return [
            TipoPrestamo.LOCAL,
            TipoPrestamo.INTERBIBLIOTECARIO
        ];
    }

    public static fromString(value?: string | null): TipoPrestamo {
        if (!value) return TipoPrestamo.LOCAL;
        const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
        const found = TipoPrestamo.values().find(
            (s) => s.value === normalized || s.name.toUpperCase() === normalized
        );
        return found || TipoPrestamo.LOCAL;
    }

    public static fromObject(obj: any): TipoPrestamo {
        if (!obj) return TipoPrestamo.LOCAL;
        if (typeof obj === "string") return TipoPrestamo.fromString(obj);
        return TipoPrestamo.fromString(obj.value || obj.name);
    }

    public toOption(): { value: string; label: string } {
        return {
            value: this.value,
            label: this.name
        };
    }

    public static toOptions(): Array<{ value: string; label: string }> {
        return TipoPrestamo.values().map((status) => status.toOption());
    }

}
