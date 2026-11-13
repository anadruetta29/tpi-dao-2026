import { BaseEntity } from "./base-entity";

export class MotivoMulta extends BaseEntity {
    public static readonly ENTREGA_TARDIA = new MotivoMulta("ENTREGA_TARDIA", "Entrega tardía");
    public static readonly EXTRAVIO = new MotivoMulta("EXTRAVIO", "Extravío");
    public static readonly DESTRUCCION = new MotivoMulta("DESTRUCCION", "Destrucción");

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

    public static values(): MotivoMulta[] {
        return [
            MotivoMulta.ENTREGA_TARDIA,
            MotivoMulta.EXTRAVIO,
            MotivoMulta.DESTRUCCION
        ];
    }

    public static fromString(value?: string | null): MotivoMulta {
        if (!value) return MotivoMulta.ENTREGA_TARDIA;
        const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
        const found = MotivoMulta.values().find(
            (s) => s.value === normalized || s.name.toUpperCase() === normalized
        );
        return found || MotivoMulta.ENTREGA_TARDIA;
    }

    public static fromObject(obj: any): MotivoMulta {
        if (!obj) return MotivoMulta.ENTREGA_TARDIA;
        if (typeof obj === "string") return MotivoMulta.fromString(obj);
        return MotivoMulta.fromString(obj.value || obj.name);
    }

    public toOption(): { value: string; label: string } {
        return {
            value: this.value,
            label: this.name
        };
    }

    public static toOptions(): Array<{ value: string; label: string }> {
        return MotivoMulta.values().map((status) => status.toOption());
    }

}
