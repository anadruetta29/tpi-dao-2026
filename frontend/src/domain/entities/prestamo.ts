import { BaseEntity } from "./base-entity";
import { EstadoPrestamo } from "./estado-prestamo";
import { ModalidadPrestamoLocal } from "./modalidad-prestamo-local";

export { EstadoPrestamo } from "./estado-prestamo";
export { ModalidadPrestamoLocal } from "./modalidad-prestamo-local";

export class Prestamo extends BaseEntity {

    public estadoName: string;
    public modalidadName: string;

    // ======== Constructor ======== //

    constructor(
        public id: string,
        public fechaInicio?: string | Date | null,
        public fechaVencimiento?: string | Date | null,
        public fechaDevolucion?: string | Date | null,
        public estado: EstadoPrestamo = EstadoPrestamo.ACTIVO,
        public modalidad: ModalidadPrestamoLocal = ModalidadPrestamoLocal.DOMICILIO,
        public solicitudId: string = "",
        public sedeId: string = "",
        public ejemplarId: string = ""
    ) {
        super();
        this.estadoName = this.estado.name;
        this.modalidadName = this.modalidad.name;
    }

    // ======== Custom Getters ======== //

    public get estadoEntity(): EstadoPrestamo {
        return this.estado;
    }

    public get modalidadEntity(): ModalidadPrestamoLocal {
        return this.modalidad;
    }

    // ======== Static Factories & Methods ======== //

    public static from(raw: any): Prestamo | null {
        return Prestamo.fromObject(raw);
    }

    public static fromObject(obj: any): Prestamo | null {
        if (!obj) return null;

        const estado = EstadoPrestamo.fromObject(obj.estado);
        const modalidad = ModalidadPrestamoLocal.fromObject(obj.modalidad);

        return new Prestamo(
            obj.id !== undefined && obj.id !== null ? String(obj.id) : "",
            obj.fechaInicio || null,
            obj.fechaVencimiento || null,
            obj.fechaDevolucion || null,
            estado,
            modalidad,
            String(obj.solicitudId ?? obj.solicitud_id ?? ""),
            String(obj.sedeId ?? obj.sede_id ?? ""),
            String(obj.ejemplarId ?? obj.ejemplar_id ?? "")
        );
    }

    public static fromList(list: any[]): Prestamo[] {
        if (!Array.isArray(list)) return [];

        return list
            .map((item) => Prestamo.fromObject(item))
            .filter((p): p is Prestamo => p !== null);
    }

}
