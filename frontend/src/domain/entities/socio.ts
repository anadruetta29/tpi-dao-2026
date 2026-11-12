import { BaseEntity } from "./base-entity";
import { EstadoSocio } from "./estado-socio";

export { EstadoSocio } from "./estado-socio";

export class Socio extends BaseEntity {

    public estadoName: string;

    // ======== Constructor ======== //

    constructor(
        public id: string,
        public nombre: string = "",
        public apellido: string = "",
        public documento: string = "",
        public email: string = "",
        public telefono: string = "",
        public estado: EstadoSocio = EstadoSocio.HABILITADO
    ) {
        super();
        this.estadoName = this.estado.name;
    }

    // ======== Custom Getters ======== //

    public get estadoEntity(): EstadoSocio {
        return this.estado;
    }

    // ======== Static Factories & Methods ======== //

    public static from(raw: any): Socio | null {
        return Socio.fromObject(raw);
    }

    public static fromObject(obj: any): Socio | null {
        if (!obj) return null;

        const estado = EstadoSocio.fromObject(obj.estado);

        return new Socio(
            obj.id !== undefined && obj.id !== null ? String(obj.id) : "",
            obj.nombre || "",
            obj.apellido || "",
            obj.documento || "",
            obj.email || "",
            obj.telefono || "",
            estado
        );
    }

    public static fromList(list: any[]): Socio[] {
        if (!Array.isArray(list)) return [];

        return list
            .map((item) => Socio.fromObject(item))
            .filter((s): s is Socio => s !== null);
    }

}
