import { EstadoEjemplar } from "@/domain/entities/ejemplar";

export class IncidenciaPorEstado {
    constructor(
        public estado: string = "",
        public cantidad: number = 0
    ) {}

    public get estadoLabel(): string {
        return this.estado ? EstadoEjemplar.fromString(this.estado).name : "";
    }

    public static fromObject(obj: any): IncidenciaPorEstado | null {
        if (!obj) return null;
        return new IncidenciaPorEstado(String(obj.estado ?? ""), Number(obj.cantidad ?? 0));
    }

    public static fromList(list: any[]): IncidenciaPorEstado[] {
        if (!Array.isArray(list)) return [];
        return list.map((item) => IncidenciaPorEstado.fromObject(item)).filter((x): x is IncidenciaPorEstado => x !== null);
    }
}

export class LogisticaSedeResumen {
    constructor(
        public sedeId: string = "",
        public sedeNombre: string = "",
        public totalEnvios: number = 0,
        public exitosos: number = 0,
        public conIncidencia: number = 0,
        public enCurso: number = 0,
        public tasaExitoPorcentaje: number = 0,
        public tasaIncidenciaPorcentaje: number = 0
    ) {}

    public static fromObject(obj: any): LogisticaSedeResumen | null {
        if (!obj) return null;
        return new LogisticaSedeResumen(
            String(obj.sede_id ?? obj.sedeId ?? ""),
            String(obj.sede_nombre ?? obj.sedeNombre ?? ""),
            Number(obj.total_envios ?? obj.totalEnvios ?? 0),
            Number(obj.exitosos ?? 0),
            Number(obj.con_incidencia ?? obj.conIncidencia ?? 0),
            Number(obj.en_curso ?? obj.enCurso ?? 0),
            Number(obj.tasa_exito_porcentaje ?? obj.tasaExitoPorcentaje ?? 0),
            Number(obj.tasa_incidencia_porcentaje ?? obj.tasaIncidenciaPorcentaje ?? 0)
        );
    }

    public static fromList(list: any[]): LogisticaSedeResumen[] {
        if (!Array.isArray(list)) return [];
        return list.map((item) => LogisticaSedeResumen.fromObject(item)).filter((x): x is LogisticaSedeResumen => x !== null);
    }
}

export class IncidenciaDetalle {
    constructor(
        public remitoId: string = "",
        public remitoNumero: string = "",
        public sedeOrigenNombre: string = "",
        public sedeDestinoNombre: string = "",
        public ejemplarId: string = "",
        public ejemplarCodigo: string = "",
        public estado: string = "",
        public observacion: string = ""
    ) {}

    public get estadoLabel(): string {
        return this.estado ? EstadoEjemplar.fromString(this.estado).name : "";
    }

    public static fromObject(obj: any): IncidenciaDetalle | null {
        if (!obj) return null;
        return new IncidenciaDetalle(
            String(obj.remito_id ?? obj.remitoId ?? ""),
            String(obj.remito_numero ?? obj.remitoNumero ?? ""),
            String(obj.sede_origen_nombre ?? obj.sedeOrigenNombre ?? ""),
            String(obj.sede_destino_nombre ?? obj.sedeDestinoNombre ?? ""),
            String(obj.ejemplar_id ?? obj.ejemplarId ?? ""),
            String(obj.ejemplar_codigo ?? obj.ejemplarCodigo ?? ""),
            String(obj.estado ?? ""),
            String(obj.observacion ?? "")
        );
    }

    public static fromList(list: any[]): IncidenciaDetalle[] {
        if (!Array.isArray(list)) return [];
        return list.map((item) => IncidenciaDetalle.fromObject(item)).filter((x): x is IncidenciaDetalle => x !== null);
    }
}

export class LogisticaIncidenciasReport {
    constructor(
        public totalRemitos: number = 0,
        public remitosFinalizados: number = 0,
        public remitosExitosos: number = 0,
        public remitosConIncidencia: number = 0,
        public remitosEnCurso: number = 0,
        public tasaExitoPorcentaje: number = 0,
        public tasaIncidenciaPorcentaje: number = 0,
        public incidenciasPorEstado: IncidenciaPorEstado[] = [],
        public porSedeOrigen: LogisticaSedeResumen[] = [],
        public incidenciasRecientes: IncidenciaDetalle[] = []
    ) {}

    public static fromObject(obj: any): LogisticaIncidenciasReport | null {
        if (!obj) return null;
        return new LogisticaIncidenciasReport(
            Number(obj.total_remitos ?? obj.totalRemitos ?? 0),
            Number(obj.remitos_finalizados ?? obj.remitosFinalizados ?? 0),
            Number(obj.remitos_exitosos ?? obj.remitosExitosos ?? 0),
            Number(obj.remitos_con_incidencia ?? obj.remitosConIncidencia ?? 0),
            Number(obj.remitos_en_curso ?? obj.remitosEnCurso ?? 0),
            Number(obj.tasa_exito_porcentaje ?? obj.tasaExitoPorcentaje ?? 0),
            Number(obj.tasa_incidencia_porcentaje ?? obj.tasaIncidenciaPorcentaje ?? 0),
            IncidenciaPorEstado.fromList(obj.incidencias_por_estado ?? obj.incidenciasPorEstado ?? []),
            LogisticaSedeResumen.fromList(obj.por_sede_origen ?? obj.porSedeOrigen ?? []),
            IncidenciaDetalle.fromList(obj.incidencias_recientes ?? obj.incidenciasRecientes ?? [])
        );
    }
}
