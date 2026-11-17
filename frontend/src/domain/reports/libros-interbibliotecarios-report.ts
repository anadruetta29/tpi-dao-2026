export class LibroInterbibliotecarioItem {
    constructor(
        public libroId: string = "",
        public titulo: string = "",
        public editorial: string = "",
        public autores: string[] = [],
        public totalSolicitudes: number = 0,
        public aprobadas: number = 0,
        public pendientes: number = 0,
        public rechazadas: number = 0,
        public canceladas: number = 0,
        public tasaAprobacionPorcentaje: number = 0,
        public sedesSolicitantes: string[] = []
    ) {}

    public static fromObject(obj: any): LibroInterbibliotecarioItem | null {
        if (!obj) return null;
        return new LibroInterbibliotecarioItem(
            String(obj.libro_id ?? obj.libroId ?? ""),
            String(obj.titulo ?? ""),
            String(obj.editorial ?? ""),
            Array.isArray(obj.autores) ? obj.autores.map(String) : [],
            Number(obj.total_solicitudes ?? obj.totalSolicitudes ?? 0),
            Number(obj.aprobadas ?? 0),
            Number(obj.pendientes ?? 0),
            Number(obj.rechazadas ?? 0),
            Number(obj.canceladas ?? 0),
            Number(obj.tasa_aprobacion_porcentaje ?? obj.tasaAprobacionPorcentaje ?? 0),
            Array.isArray(obj.sedes_solicitantes ?? obj.sedesSolicitantes)
                ? (obj.sedes_solicitantes ?? obj.sedesSolicitantes).map(String)
                : []
        );
    }

    public static fromList(list: any[]): LibroInterbibliotecarioItem[] {
        if (!Array.isArray(list)) return [];
        return list
            .map((item) => LibroInterbibliotecarioItem.fromObject(item))
            .filter((x): x is LibroInterbibliotecarioItem => x !== null);
    }
}

export class LibrosInterbibliotecariosReport {
    constructor(
        public totalSolicitudesInterbibliotecarias: number = 0,
        public totalLibrosDistintos: number = 0,
        public tasaAprobacionGlobalPorcentaje: number = 0,
        public libros: LibroInterbibliotecarioItem[] = []
    ) {}

    public static fromObject(obj: any): LibrosInterbibliotecariosReport | null {
        if (!obj) return null;
        return new LibrosInterbibliotecariosReport(
            Number(obj.total_solicitudes_interbibliotecarias ?? obj.totalSolicitudesInterbibliotecarias ?? 0),
            Number(obj.total_libros_distintos ?? obj.totalLibrosDistintos ?? 0),
            Number(obj.tasa_aprobacion_global_porcentaje ?? obj.tasaAprobacionGlobalPorcentaje ?? 0),
            LibroInterbibliotecarioItem.fromList(obj.libros ?? [])
        );
    }
}
