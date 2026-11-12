import { BaseEntity } from "./base-entity";

export class Remito extends BaseEntity {

    // ======== Constructor ======== //

    constructor(
        public id: string,
        public numero: string = "",
        public fechaEmision?: string | Date | null,
        public fechaDespacho?: string | Date | null,
        public fechaRecepcion?: string | Date | null
    ) {
        super();
    }

    // ======== Static Factories & Methods ======== //

    public static from(raw: any): Remito | null {
        return Remito.fromObject(raw);
    }

    public static fromObject(obj: any): Remito | null {
        if (!obj) return null;

        return new Remito(
            obj.id !== undefined && obj.id !== null ? String(obj.id) : "",
            obj.numero || "",
            obj.fechaEmision || null,
            obj.fechaDespacho || null,
            obj.fechaRecepcion || null
        );
    }

    public static fromList(list: any[]): Remito[] {
        if (!Array.isArray(list)) return [];

        return list
            .map((item) => Remito.fromObject(item))
            .filter((r): r is Remito => r !== null);
    }

}
