import { BaseEntity } from "./base-entity";
import { EstadoEnvio } from "./estado-envio";

export const DIAS_PARA_ATRASO_REMITO = 3;

export class Remito extends BaseEntity {

    // ======== Constructor ======== //

    constructor(
        public id: string,
        public numero: string = "",
        public fechaEmision?: string | Date | null,
        public fechaDespacho?: string | Date | null,
        public fechaRecepcion?: string | Date | null,
        public sedeOrigenId: string = "",
        public sedeDestinoId: string = "",
        public ejemplaresIds: string[] = [],
        public solicitudId: string = "",
        public estadoActual: EstadoEnvio | null = null,
        public diasTransito: number | null = null
    ) {
        super();
    }

    public get estaAtrasado(): boolean {
        return (this.estadoActual === EstadoEnvio.DESPACHADO || this.estadoActual === EstadoEnvio.EN_TRANSITO)
            && this.diasTransito !== null && this.diasTransito >= DIAS_PARA_ATRASO_REMITO;
    }

    // ======== Static Factories & Methods ======== //

    public static from(raw: any): Remito | null {
        return Remito.fromObject(raw);
    }

    public static fromObject(obj: any): Remito | null {
        if (!obj) return null;

        const estado = obj.estadoActual ?? obj.estado_actual;
        const dias = obj.diasTransito ?? obj.dias_transito;
        return new Remito(
            obj.id !== undefined && obj.id !== null ? String(obj.id) : "",
            obj.numero || "",
            obj.fechaEmision || null,
            obj.fechaDespacho || null,
            obj.fechaRecepcion || null,
            String(obj.sedeOrigenId ?? obj.sede_origen_id ?? ""),
            String(obj.sedeDestinoId ?? obj.sede_destino_id ?? ""),
            (obj.ejemplaresIds ?? obj.ejemplar_ids ?? []).map(String),
            String(obj.solicitudId ?? obj.solicitud_id ?? ""),
            estado ? EstadoEnvio.fromObject(estado) : null,
            typeof dias === "number" ? dias : null
        );
    }

    public static fromList(list: any[]): Remito[] {
        if (!Array.isArray(list)) return [];

        return list
            .map((item) => Remito.fromObject(item))
            .filter((r): r is Remito => r !== null);
    }

}
