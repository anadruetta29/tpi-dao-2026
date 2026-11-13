export interface CacheConfig {
    tags?: string[];
    revalidate?: number | false;
}

export class CacheTags {
    public static readonly AUTH_ME = "auth:me";
    public static readonly USUARIOS = "usuarios";
    public static usuarioDetail(id: string): string {
        return `usuario:${id}`;
    }
    public static readonly SOCIOS = "socios";
    public static readonly SEDES = "sedes";
    public static readonly LIBROS = "libros";
    public static libroDetail(id: string): string {
        return `libro:${id}`;
    }
    public static libroDisponibilidad(id: string): string {
        return `libro:${id}:disponibilidad`;
    }
    public static readonly AUTORES = "autores";
    public static readonly EJEMPLARES = "ejemplares";
    public static ejemplarDetail(id: string): string {
        return `ejemplar:${id}`;
    }
    public static readonly RESERVAS = "reservas";
    public static readonly SOLICITUDES_PRESTAMO = "solicitudes-prestamo";
    public static readonly PRESTAMOS = "prestamos";
    public static prestamoDetail(id: string): string {
        return `prestamo:${id}`;
    }
    public static readonly DEVOLUCIONES = "devoluciones";
    public static readonly MULTAS = "multas";
    public static multaDetail(id: string): string {
        return `multa:${id}`;
    }
    public static readonly REMITOS = "remitos";
    public static remitoDetail(id: string): string {
        return `remito:${id}`;
    }
    public static remitoTrazabilidad(id: string): string {
        return `remito:${id}:trazabilidad`;
    }
}

export function withCacheTags(...tags: Array<string | false | null | undefined>): CacheConfig {
    const validTags = tags.filter((tag): tag is string => Boolean(tag));
    return {
        tags: validTags
    };
}
