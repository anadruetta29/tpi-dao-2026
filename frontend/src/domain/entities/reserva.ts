import { BaseEntity } from "./base-entity";
import { EstadoReserva } from "./estado-reserva";

export { EstadoReserva } from "./estado-reserva";

export class Reserva extends BaseEntity {

    public estadoName: string;

    // ======== Constructor ======== //

    constructor(
        public id: string,
        public fecha?: string | Date | null,
        public estado: EstadoReserva = EstadoReserva.ACTIVA
    ) {
        super();
        this.estadoName = this.estado.name;
    }

    // ======== Custom Getters ======== //

    public get estadoEntity(): EstadoReserva {
        return this.estado;
    }

    // ======== Static Factories & Methods ======== //

    public static from(raw: any): Reserva | null {
        return Reserva.fromObject(raw);
    }

    public static fromObject(obj: any): Reserva | null {
        if (!obj) return null;

        const estado = EstadoReserva.fromObject(obj.estado);

        return new Reserva(
            obj.id !== undefined && obj.id !== null ? String(obj.id) : "",
            obj.fecha || null,
            estado
        );
    }

    public static fromList(list: any[]): Reserva[] {
        if (!Array.isArray(list)) return [];

        return list
            .map((item) => Reserva.fromObject(item))
            .filter((r): r is Reserva => r !== null);
    }

}
