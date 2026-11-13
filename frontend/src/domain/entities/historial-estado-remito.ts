import { BaseEntity } from "./base-entity";
import { EstadoEnvio } from "./estado-envio";

export { EstadoEnvio } from "./estado-envio";

export class HistorialEstadoRemito extends BaseEntity {

    public estadoName: string;

    // ======== Constructor ======== //

    constructor(
        public id: string,
        public fechaInicio?: string | Date | null,
        public fechaFin?: string | Date | null,
        public estado: EstadoEnvio = EstadoEnvio.PENDIENTE
    ) {
        super();
        this.estadoName = this.estado.name;
    }

    // ======== Custom Getters ======== //

    public get estadoEntity(): EstadoEnvio {
        return this.estado;
    }

    // ======== Static Factories & Methods ======== //

    public static from(raw: any): HistorialEstadoRemito | null {
        return HistorialEstadoRemito.fromObject(raw);
    }

    public static fromObject(obj: any): HistorialEstadoRemito | null {
        if (!obj) return null;

        const estado = EstadoEnvio.fromObject(obj.estado);

        return new HistorialEstadoRemito(
            obj.id !== undefined && obj.id !== null ? String(obj.id) : "",
            obj.fechaInicio || null,
            obj.fechaFin || null,
            estado
        );
    }

    public static fromList(list: any[]): HistorialEstadoRemito[] {
        if (!Array.isArray(list)) return [];

        return list
            .map((item) => HistorialEstadoRemito.fromObject(item))
            .filter((h): h is HistorialEstadoRemito => h !== null);
    }

}
