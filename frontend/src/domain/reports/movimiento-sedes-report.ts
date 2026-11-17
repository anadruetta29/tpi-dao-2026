export class MovimientoRuta {
    constructor(
        public sedeOrigenId: string = "",
        public sedeOrigenNombre: string = "",
        public sedeDestinoId: string = "",
        public sedeDestinoNombre: string = "",
        public cantidadRemitos: number = 0,
        public cantidadEjemplares: number = 0,
        public remitosRecibidos: number = 0,
        public remitosEnTransito: number = 0,
        public tiempoPromedioTransitoDias: number | null = null,
        public tiempoMinimoTransitoDias: number | null = null,
        public tiempoMaximoTransitoDias: number | null = null
    ) {}

    public static fromObject(obj: any): MovimientoRuta | null {
        if (!obj) return null;
        return new MovimientoRuta(
            String(obj.sede_origen_id ?? obj.sedeOrigenId ?? ""),
            String(obj.sede_origen_nombre ?? obj.sedeOrigenNombre ?? ""),
            String(obj.sede_destino_id ?? obj.sedeDestinoId ?? ""),
            String(obj.sede_destino_nombre ?? obj.sedeDestinoNombre ?? ""),
            Number(obj.cantidad_remitos ?? obj.cantidadRemitos ?? 0),
            Number(obj.cantidad_ejemplares ?? obj.cantidadEjemplares ?? 0),
            Number(obj.remitos_recibidos ?? obj.remitosRecibidos ?? 0),
            Number(obj.remitos_en_transito ?? obj.remitosEnTransito ?? 0),
            typeof (obj.tiempo_promedio_transito_dias ?? obj.tiempoPromedioTransitoDias) === "number"
                ? (obj.tiempo_promedio_transito_dias ?? obj.tiempoPromedioTransitoDias)
                : null,
            typeof (obj.tiempo_minimo_transito_dias ?? obj.tiempoMinimoTransitoDias) === "number"
                ? (obj.tiempo_minimo_transito_dias ?? obj.tiempoMinimoTransitoDias)
                : null,
            typeof (obj.tiempo_maximo_transito_dias ?? obj.tiempoMaximoTransitoDias) === "number"
                ? (obj.tiempo_maximo_transito_dias ?? obj.tiempoMaximoTransitoDias)
                : null
        );
    }

    public static fromList(list: any[]): MovimientoRuta[] {
        if (!Array.isArray(list)) return [];
        return list.map((item) => MovimientoRuta.fromObject(item)).filter((x): x is MovimientoRuta => x !== null);
    }
}

export class MovimientoSedesReport {
    constructor(
        public totalRemitos: number = 0,
        public totalEjemplaresMovidos: number = 0,
        public tiempoPromedioGlobalDias: number | null = null,
        public rutas: MovimientoRuta[] = []
    ) {}

    public static fromObject(obj: any): MovimientoSedesReport | null {
        if (!obj) return null;
        return new MovimientoSedesReport(
            Number(obj.total_remitos ?? obj.totalRemitos ?? 0),
            Number(obj.total_ejemplares_movidos ?? obj.totalEjemplaresMovidos ?? 0),
            typeof (obj.tiempo_promedio_global_dias ?? obj.tiempoPromedioGlobalDias) === "number"
                ? (obj.tiempo_promedio_global_dias ?? obj.tiempoPromedioGlobalDias)
                : null,
            MovimientoRuta.fromList(obj.rutas ?? [])
        );
    }
}
