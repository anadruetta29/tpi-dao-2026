import { BaseEntity } from "./base-entity";
import { EstadoEjemplar } from "./estado-ejemplar";

export { EstadoEjemplar } from "./estado-ejemplar";

export class Ejemplar extends BaseEntity {

    public estadoName: string;

    // ======== Constructor ======== //

    constructor(
        public id: string,
        public codigo: string = "",
        public estado: EstadoEjemplar = EstadoEjemplar.DISPONIBLE
    ) {
        super();
        this.estadoName = this.estado.name;
    }

    // ======== Custom Getters ======== //

    public get estadoEntity(): EstadoEjemplar {
        return this.estado;
    }

    // ======== Static Factories & Methods ======== //

    public static from(raw: any): Ejemplar | null {
        return Ejemplar.fromObject(raw);
    }

    public static fromObject(obj: any): Ejemplar | null {
        if (!obj) return null;

        const estado = EstadoEjemplar.fromObject(obj.estado);

        return new Ejemplar(
            obj.id !== undefined && obj.id !== null ? String(obj.id) : "",
            obj.codigo || "",
            estado
        );
    }

    public static fromList(list: any[]): Ejemplar[] {
        if (!Array.isArray(list)) return [];

        return list
            .map((item) => Ejemplar.fromObject(item))
            .filter((e): e is Ejemplar => e !== null);
    }

}
