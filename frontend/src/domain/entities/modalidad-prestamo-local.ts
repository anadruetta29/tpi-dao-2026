import { BaseEntity } from "./base-entity";

export class ModalidadPrestamoLocal extends BaseEntity {
    public static readonly DOMICILIO = new ModalidadPrestamoLocal("DOMICILIO", "Domicilio");
    public static readonly SALA_LECTURA = new ModalidadPrestamoLocal("SALA_LECTURA", "Sala de lectura");

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

    public static values(): ModalidadPrestamoLocal[] {
        return [
            ModalidadPrestamoLocal.DOMICILIO,
            ModalidadPrestamoLocal.SALA_LECTURA
        ];
    }

    public static fromString(value?: string | null): ModalidadPrestamoLocal {
        if (!value) return ModalidadPrestamoLocal.DOMICILIO;
        const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
        const found = ModalidadPrestamoLocal.values().find(
            (s) => s.value === normalized || s.name.toUpperCase() === normalized
        );
        return found || ModalidadPrestamoLocal.DOMICILIO;
    }

    public static fromObject(obj: any): ModalidadPrestamoLocal {
        if (!obj) return ModalidadPrestamoLocal.DOMICILIO;
        if (typeof obj === "string") return ModalidadPrestamoLocal.fromString(obj);
        return ModalidadPrestamoLocal.fromString(obj.value || obj.name);
    }

    public toOption(): { value: string; label: string } {
        return {
            value: this.value,
            label: this.name
        };
    }

    public static toOptions(): Array<{ value: string; label: string }> {
        return ModalidadPrestamoLocal.values().map((status) => status.toOption());
    }

}
