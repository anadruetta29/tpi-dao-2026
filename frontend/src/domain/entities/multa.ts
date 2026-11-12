import { BaseEntity } from "./base-entity";
import { MotivoMulta } from "./motivo-multa";
import { EstadoMulta } from "./estado-multa";

export { MotivoMulta } from "./motivo-multa";
export { EstadoMulta } from "./estado-multa";

export class Multa extends BaseEntity {

    public motivoName: string;
    public estadoName: string;

    // ======== Constructor ======== //

    constructor(
        public id: string,
        public fechaEmision?: string | Date | null,
        public motivo: MotivoMulta = MotivoMulta.ENTREGA_TARDIA,
        public monto: number = 0,
        public estado: EstadoMulta = EstadoMulta.PENDIENTE,
        public fechaPago?: string | Date | null
    ) {
        super();
        this.motivoName = this.motivo.name;
        this.estadoName = this.estado.name;
    }

    // ======== Custom Getters ======== //

    public get motivoEntity(): MotivoMulta {
        return this.motivo;
    }

    public get estadoEntity(): EstadoMulta {
        return this.estado;
    }

    // ======== Static Factories & Methods ======== //

    public static from(raw: any): Multa | null {
        return Multa.fromObject(raw);
    }

    public static fromObject(obj: any): Multa | null {
        if (!obj) return null;

        const motivo = MotivoMulta.fromObject(obj.motivo);
        const estado = EstadoMulta.fromObject(obj.estado);

        return new Multa(
            obj.id !== undefined && obj.id !== null ? String(obj.id) : "",
            obj.fechaEmision || null,
            motivo,
            typeof obj.monto === "number" ? obj.monto : Number(obj.monto || 0),
            estado,
            obj.fechaPago || null
        );
    }

    public static fromList(list: any[]): Multa[] {
        if (!Array.isArray(list)) return [];

        return list
            .map((item) => Multa.fromObject(item))
            .filter((m): m is Multa => m !== null);
    }

}
