import { BaseEntity } from "./base-entity";

export class Autor extends BaseEntity {

    // ======== Constructor ======== //

    constructor(
        public id: string,
        public nombre: string = "",
        public apellido: string = ""
    ) {
        super();
    }

    // ======== Static Factories & Methods ======== //

    public static from(raw: any): Autor | null {
        return Autor.fromObject(raw);
    }

    public static fromObject(obj: any): Autor | null {
        if (!obj) return null;

        return new Autor(
            obj.id !== undefined && obj.id !== null ? String(obj.id) : "",
            obj.nombre || "",
            obj.apellido || ""
        );
    }

    public static fromList(list: any[]): Autor[] {
        if (!Array.isArray(list)) return [];

        return list
            .map((item) => Autor.fromObject(item))
            .filter((a): a is Autor => a !== null);
    }

}
