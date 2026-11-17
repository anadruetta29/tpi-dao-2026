import { MotivoMulta } from "@/domain/entities/motivo-multa";

export class MultaPorMotivoResumen {
    constructor(
        public motivo: string = "",
        public cantidad: number = 0,
        public montoTotal: number = 0,
        public montoPendiente: number = 0,
        public montoPagado: number = 0
    ) {}

    public get motivoLabel(): string {
        return this.motivo ? MotivoMulta.fromString(this.motivo).name : "";
    }

    public static fromObject(obj: any): MultaPorMotivoResumen | null {
        if (!obj) return null;
        return new MultaPorMotivoResumen(
            String(obj.motivo ?? ""),
            Number(obj.cantidad ?? 0),
            Number(obj.monto_total ?? obj.montoTotal ?? 0),
            Number(obj.monto_pendiente ?? obj.montoPendiente ?? 0),
            Number(obj.monto_pagado ?? obj.montoPagado ?? 0)
        );
    }

    public static fromList(list: any[]): MultaPorMotivoResumen[] {
        if (!Array.isArray(list)) return [];
        return list.map((item) => MultaPorMotivoResumen.fromObject(item)).filter((x): x is MultaPorMotivoResumen => x !== null);
    }
}

export class MultasSedeResumen {
    constructor(
        public sedeId: string = "",
        public sedeNombre: string = "",
        public prestamosVencidos: number = 0,
        public montoPendiente: number = 0,
        public montoPagado: number = 0,
        public montoAnulado: number = 0
    ) {}

    public static fromObject(obj: any): MultasSedeResumen | null {
        if (!obj) return null;
        return new MultasSedeResumen(
            String(obj.sede_id ?? obj.sedeId ?? ""),
            String(obj.sede_nombre ?? obj.sedeNombre ?? ""),
            Number(obj.prestamos_vencidos ?? obj.prestamosVencidos ?? 0),
            Number(obj.monto_pendiente ?? obj.montoPendiente ?? 0),
            Number(obj.monto_pagado ?? obj.montoPagado ?? 0),
            Number(obj.monto_anulado ?? obj.montoAnulado ?? 0)
        );
    }

    public static fromList(list: any[]): MultasSedeResumen[] {
        if (!Array.isArray(list)) return [];
        return list.map((item) => MultasSedeResumen.fromObject(item)).filter((x): x is MultasSedeResumen => x !== null);
    }
}

export class PrestamoVencidoDetalle {
    constructor(
        public prestamoId: string = "",
        public socioId: string = "",
        public socioNombre: string = "",
        public socioDocumento: string = "",
        public sedeId: string = "",
        public sedeNombre: string = "",
        public fechaInicio: string | null = null,
        public fechaVencimiento: string | null = null,
        public diasAtraso: number = 0,
        public cantidadEjemplaresPendientes: number = 0,
        public multaPendienteMonto: number = 0
    ) {}

    public static fromObject(obj: any): PrestamoVencidoDetalle | null {
        if (!obj) return null;
        return new PrestamoVencidoDetalle(
            String(obj.prestamo_id ?? obj.prestamoId ?? ""),
            String(obj.socio_id ?? obj.socioId ?? ""),
            String(obj.socio_nombre ?? obj.socioNombre ?? ""),
            String(obj.socio_documento ?? obj.socioDocumento ?? ""),
            String(obj.sede_id ?? obj.sedeId ?? ""),
            String(obj.sede_nombre ?? obj.sedeNombre ?? ""),
            obj.fecha_inicio ?? obj.fechaInicio ?? null,
            obj.fecha_vencimiento ?? obj.fechaVencimiento ?? null,
            Number(obj.dias_atraso ?? obj.diasAtraso ?? 0),
            Number(obj.cantidad_ejemplares_pendientes ?? obj.cantidadEjemplaresPendientes ?? 0),
            Number(obj.multa_pendiente_monto ?? obj.multaPendienteMonto ?? 0)
        );
    }

    public static fromList(list: any[]): PrestamoVencidoDetalle[] {
        if (!Array.isArray(list)) return [];
        return list.map((item) => PrestamoVencidoDetalle.fromObject(item)).filter((x): x is PrestamoVencidoDetalle => x !== null);
    }
}

export class PrestamosVencidosMultasReport {
    constructor(
        public totalPrestamosVencidos: number = 0,
        public promedioDiasAtraso: number = 0,
        public maxDiasAtraso: number = 0,
        public totalMultas: number = 0,
        public montoTotalMultas: number = 0,
        public montoPendiente: number = 0,
        public montoPagado: number = 0,
        public montoAnulado: number = 0,
        public porMotivo: MultaPorMotivoResumen[] = [],
        public porSede: MultasSedeResumen[] = [],
        public prestamosVencidos: PrestamoVencidoDetalle[] = []
    ) {}

    public static fromObject(obj: any): PrestamosVencidosMultasReport | null {
        if (!obj) return null;
        return new PrestamosVencidosMultasReport(
            Number(obj.total_prestamos_vencidos ?? obj.totalPrestamosVencidos ?? 0),
            Number(obj.promedio_dias_atraso ?? obj.promedioDiasAtraso ?? 0),
            Number(obj.max_dias_atraso ?? obj.maxDiasAtraso ?? 0),
            Number(obj.total_multas ?? obj.totalMultas ?? 0),
            Number(obj.monto_total_multas ?? obj.montoTotalMultas ?? 0),
            Number(obj.monto_pendiente ?? obj.montoPendiente ?? 0),
            Number(obj.monto_pagado ?? obj.montoPagado ?? 0),
            Number(obj.monto_anulado ?? obj.montoAnulado ?? 0),
            MultaPorMotivoResumen.fromList(obj.por_motivo ?? obj.porMotivo ?? []),
            MultasSedeResumen.fromList(obj.por_sede ?? obj.porSede ?? []),
            PrestamoVencidoDetalle.fromList(obj.prestamos_vencidos ?? obj.prestamosVencidos ?? [])
        );
    }
}
