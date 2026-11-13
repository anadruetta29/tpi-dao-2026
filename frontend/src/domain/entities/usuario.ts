import { BaseEntity } from "./base-entity";
import { Rol } from "./rol";

export { Rol } from "./rol";

export class Usuario extends BaseEntity {

    public roleName: string;

    // ======== Constructor ======== //

    constructor(
        public id: string,
        public nombre: string = "",
        public apellido: string = "",
        public email: string = "",
        public password: string = "",
        public activo: boolean = true,
        public role: Rol = Rol.RECEPCIONISTA
    ) {
        super();
        this.roleName = this.role.name;
    }

    // ======== Custom Getters ======== //

    public get roleEntity(): Rol {
        return this.role;
    }

    // ======== Static Factories & Methods ======== //

    public static from(raw: any): Usuario | null {
        return Usuario.fromObject(raw);
    }

    public static fromObject(obj: any): Usuario | null {
        if (!obj) return null;

        const role = Rol.fromObject(obj.role);

        return new Usuario(
            obj.id !== undefined && obj.id !== null ? String(obj.id) : "",
            obj.nombre || "",
            obj.apellido || "",
            obj.email || "",
            obj.password || "",
            typeof obj.activo === "boolean" ? obj.activo : Boolean(obj.activo ?? true),
            role
        );
    }

    public static fromList(list: any[]): Usuario[] {
        if (!Array.isArray(list)) return [];

        return list
            .map((item) => Usuario.fromObject(item))
            .filter((u): u is Usuario => u !== null);
    }

}
