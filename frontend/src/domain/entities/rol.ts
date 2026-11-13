import { BaseEntity } from "./base-entity";

export class Rol extends BaseEntity {
    public static readonly RECEPCIONISTA = new Rol("RECEPCIONISTA", "Recepcionista");
    public static readonly MODERADOR = new Rol("MODERADOR", "Moderador");
    public static readonly ADMIN = new Rol("ADMIN", "Administrador");

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

    public static values(): Rol[] {
        return [
            Rol.RECEPCIONISTA,
            Rol.MODERADOR,
            Rol.ADMIN
        ];
    }

    public static fromString(value?: string | null): Rol {
        if (!value) return Rol.RECEPCIONISTA;
        const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
        const found = Rol.values().find(
            (s) => s.value === normalized || s.name.toUpperCase() === normalized
        );
        return found || Rol.RECEPCIONISTA;
    }

    public static fromObject(obj: any): Rol {
        if (!obj) return Rol.RECEPCIONISTA;
        if (typeof obj === "string") return Rol.fromString(obj);
        return Rol.fromString(obj.value || obj.name);
    }

    public toOption(): { value: string; label: string } {
        return {
            value: this.value,
            label: this.name
        };
    }

    public static toOptions(): Array<{ value: string; label: string }> {
        return Rol.values().map((status) => status.toOption());
    }

}
