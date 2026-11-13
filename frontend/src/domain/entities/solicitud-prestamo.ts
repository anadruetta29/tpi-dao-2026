import { BaseEntity } from "./base-entity";
import { TipoPrestamo } from "./tipo-prestamo";
import { EstadoSolicitud } from "./estado-solicitud";

export { TipoPrestamo } from "./tipo-prestamo";
export { EstadoSolicitud } from "./estado-solicitud";

export class SolicitudPrestamo extends BaseEntity {

    public tipoName: string;
    public estadoName: string;

    // ======== Constructor ======== //

    constructor(
        public id: string,
        public numero: string = "",
        public tipo: TipoPrestamo = TipoPrestamo.LOCAL,
        public estado: EstadoSolicitud = EstadoSolicitud.PENDIENTE,
        public socioId: string = "",
        public ejemplarId: string = "",
        public sedeOrigenId: string = "",
        public sedeDestinoId: string = "",
        public responsableOrigenId: string = "",
        public responsableDestinoId: string = ""
    ) {
        super();
        this.tipoName = this.tipo.name;
        this.estadoName = this.estado.name;
    }

    // ======== Custom Getters ======== //

    public get tipoEntity(): TipoPrestamo {
        return this.tipo;
    }

    public get estadoEntity(): EstadoSolicitud {
        return this.estado;
    }

    // ======== Static Factories & Methods ======== //

    public static from(raw: any): SolicitudPrestamo | null {
        return SolicitudPrestamo.fromObject(raw);
    }

    public static fromObject(obj: any): SolicitudPrestamo | null {
        if (!obj) return null;

        const tipo = TipoPrestamo.fromObject(obj.tipo);
        const estado = EstadoSolicitud.fromObject(obj.estado);

        return new SolicitudPrestamo(
            obj.id !== undefined && obj.id !== null ? String(obj.id) : "",
            obj.numero || "",
            tipo,
            estado,
            String(obj.socioId ?? obj.socio_id ?? ""),
            String(obj.ejemplarId ?? obj.ejemplar_id ?? ""),
            String(obj.sedeOrigenId ?? obj.sede_origen_id ?? ""),
            String(obj.sedeDestinoId ?? obj.sede_destino_id ?? ""),
            String(obj.responsableOrigenId ?? obj.responsable_origen_id ?? ""),
            String(obj.responsableDestinoId ?? obj.responsable_destino_id ?? "")
        );
    }

    public static fromList(list: any[]): SolicitudPrestamo[] {
        if (!Array.isArray(list)) return [];

        return list
            .map((item) => SolicitudPrestamo.fromObject(item))
            .filter((s): s is SolicitudPrestamo => s !== null);
    }

}
