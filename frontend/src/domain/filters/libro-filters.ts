export class LibroFilters {

    constructor(
        public titulo?: string | null,
        public autor?: string | null,
        public editorial?: string | null
    ) {}

    public static fromObject(obj: any): LibroFilters {
        if (!obj) return new LibroFilters();

        const rawTitulo = obj.filters?.titulo ?? obj.titulo;
        const rawAutor = obj.filters?.autor ?? obj.autor;
        const rawEditorial = obj.filters?.editorial ?? obj.editorial;

        return new LibroFilters(
            typeof rawTitulo === "string" && rawTitulo.trim() ? rawTitulo.trim() : null,
            typeof rawAutor === "string" && rawAutor.trim() ? rawAutor.trim() : null,
            typeof rawEditorial === "string" && rawEditorial.trim() ? rawEditorial.trim() : null
        );
    }

    public toApiParams(): Record<string, any> {
        const params: Record<string, any> = {};

        if (this.titulo) params.titulo = this.titulo;
        if (this.autor) params.autor = this.autor;
        if (this.editorial) params.editorial = this.editorial;

        return params;
    }

}
