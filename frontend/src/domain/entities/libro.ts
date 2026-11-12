import { BaseEntity } from "./base-entity";

export class Libro extends BaseEntity {

    // ======== Constructor ======== //

    constructor(
        public id: string,
        public titulo: string = "",
        public añoPublicacion: number = 0,
        public editorial: string = "",
        public edicion: string = ""
    ) {
        super();
    }

    // ======== Static Factories & Methods ======== //

    public static from(raw: any): Libro | null {
        return Libro.fromObject(raw);
    }

    public static fromObject(obj: any): Libro | null {
        if (!obj) return null;

        return new Libro(
            obj.id !== undefined && obj.id !== null ? String(obj.id) : "",
            obj.titulo || "",
            typeof obj.añoPublicacion === "number" ? obj.añoPublicacion : Number(obj.añoPublicacion || 0),
            obj.editorial || "",
            obj.edicion || ""
        );
    }

    public static fromList(list: any[]): Libro[] {
        if (!Array.isArray(list)) return [];

        return list
            .map((item) => Libro.fromObject(item))
            .filter((l): l is Libro => l !== null);
    }

}
