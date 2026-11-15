import { BaseEntity } from "./base-entity";

const tipoLabels: Record<string, string> = {
    RESERVA_LISTA: "Reserva lista",
    PRESTAMO_POR_VENCER: "Vencimiento próximo",
    PRESTAMO_ATRASADO: "Préstamo atrasado"
};

export class Aviso extends BaseEntity {
    public tipoName: string;

    constructor(
        public id: string,
        public tipo: string,
        public mensaje: string,
        public fecha?: string | Date | null,
        public leido: boolean = false,
        public sedeId: string = "",
        public socioId: string = "",
        public reservaId: string = "",
        public prestamoId: string = ""
    ) {
        super();
        this.tipoName = tipoLabels[this.tipo] ?? this.tipo;
    }

    public static fromObject(obj: any): Aviso | null {
        if (!obj) return null;
        return new Aviso(
            obj.id !== undefined && obj.id !== null ? String(obj.id) : "",
            String(obj.tipo ?? ""),
            String(obj.mensaje ?? ""),
            obj.fecha || null,
            Boolean(obj.leido),
            obj.sede_id != null || obj.sedeId != null ? String(obj.sede_id ?? obj.sedeId) : "",
            obj.socio_id != null || obj.socioId != null ? String(obj.socio_id ?? obj.socioId) : "",
            obj.reserva_id != null || obj.reservaId != null ? String(obj.reserva_id ?? obj.reservaId) : "",
            obj.prestamo_id != null || obj.prestamoId != null ? String(obj.prestamo_id ?? obj.prestamoId) : ""
        );
    }

    public static fromList(list: any[]): Aviso[] {
        if (!Array.isArray(list)) return [];
        return list.map((item) => Aviso.fromObject(item)).filter((a): a is Aviso => a !== null);
    }
}
