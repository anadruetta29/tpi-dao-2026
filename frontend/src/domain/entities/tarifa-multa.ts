import { BaseEntity } from "./base-entity";
import { MotivoMulta } from "./motivo-multa";

export class TarifaMulta extends BaseEntity {
    public id: string;
    public motivoName: string;
    public aplicacionLabel: string;

    constructor(
        public motivo: MotivoMulta,
        public monto: number
    ) {
        super();
        this.id = motivo.value;
        this.motivoName = motivo.name;
        this.aplicacionLabel = motivo === MotivoMulta.ENTREGA_TARDIA
            ? "Por día de atraso"
            : "Monto fijo por ejemplar";
    }

    public static from(raw: any): TarifaMulta | null {
        return TarifaMulta.fromObject(raw);
    }

    public static fromObject(obj: any): TarifaMulta | null {
        if (!obj) return null;
        return new TarifaMulta(
            MotivoMulta.fromObject(obj.motivo),
            typeof obj.monto === "number" ? obj.monto : Number(obj.monto || 0)
        );
    }

    public static fromList(list: any[]): TarifaMulta[] {
        if (!Array.isArray(list)) return [];
        return list
            .map((item) => TarifaMulta.fromObject(item))
            .filter((item): item is TarifaMulta => item !== null);
    }
}
