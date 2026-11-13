import { BaseEntity } from "./base-entity";
import { EstadoSede } from "./estado-sede";

export { EstadoSede } from "./estado-sede";

export class Sede extends BaseEntity {

    public estadoName: string;

    // ======== Constructor ======== //

    constructor(
        public id: string,
        public nombre: string = "",
        public telefono: string = "",
        public email: string = "",
        public horarioAtencion: string = "",
        public estado: EstadoSede = EstadoSede.ACTIVA
    ) {
        super();
        this.estadoName = this.estado.name;
    }

    // ======== Custom Getters ======== //

    public get estadoEntity(): EstadoSede {
        return this.estado;
    }

    // ======== Static Factories & Methods ======== //

    public static from(raw: any): Sede | null {
        return Sede.fromObject(raw);
    }

    public static fromObject(obj: any): Sede | null {
        if (!obj) return null;

        const estado = EstadoSede.fromObject(obj.estado);

        return new Sede(
            obj.id !== undefined && obj.id !== null ? String(obj.id) : "",
            obj.nombre || "",
            obj.telefono || "",
            obj.email || "",
            obj.horarioAtencion || "",
            estado
        );
    }

    public static fromList(list: any[]): Sede[] {
        if (!Array.isArray(list)) return [];

        return list
            .map((item) => Sede.fromObject(item))
            .filter((s): s is Sede => s !== null);
    }

}
