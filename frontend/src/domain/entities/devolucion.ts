import { BaseEntity } from "./base-entity";
import { EstadoEjemplar } from "./estado-ejemplar";

export { EstadoEjemplar } from "./estado-ejemplar";

export class Devolucion extends BaseEntity {

    public estadoDevueltoName: string;

    // ======== Constructor ======== //

    constructor(
        public id: string,
        public fecha?: string | Date | null,
        public observaciones?: string | null,
        public estadoDevuelto: EstadoEjemplar = EstadoEjemplar.DISPONIBLE
    ) {
        super();
        this.estadoDevueltoName = this.estadoDevuelto.name;
    }

    // ======== Custom Getters ======== //

    public get estadoDevueltoEntity(): EstadoEjemplar {
        return this.estadoDevuelto;
    }

    // ======== Static Factories & Methods ======== //

    public static from(raw: any): Devolucion | null {
        return Devolucion.fromObject(raw);
    }

    public static fromObject(obj: any): Devolucion | null {
        if (!obj) return null;

        const estadoDevuelto = EstadoEjemplar.fromObject(obj.estadoDevuelto);

        return new Devolucion(
            obj.id !== undefined && obj.id !== null ? String(obj.id) : "",
            obj.fecha || null,
            obj.observaciones || null,
            estadoDevuelto
        );
    }

    public static fromList(list: any[]): Devolucion[] {
        if (!Array.isArray(list)) return [];

        return list
            .map((item) => Devolucion.fromObject(item))
            .filter((d): d is Devolucion => d !== null);
    }

}
