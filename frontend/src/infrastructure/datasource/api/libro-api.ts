import { LibroDataSourceI } from "../../../domain/datasources/libro";
import { Libro } from "../../../domain/entities/libro";
import { Ejemplar } from "../../../domain/entities/ejemplar";
import { Sede } from "../../../domain/entities/sede";
import { LibroFilters } from "../../../domain/filters/libro-filters";
import { type GetAllLibrosReq } from "../../../domain/dto/libro/request/GetAllLibrosReq";
import { type GetAllLibrosRes } from "../../../domain/dto/libro/response/GetAllLibrosRes";
import { type GetLibroByIdReq } from "../../../domain/dto/libro/request/GetLibroByIdReq";
import { type GetLibroByIdRes } from "../../../domain/dto/libro/response/GetLibroByIdRes";
import { type GetLibroDisponibilidadReq } from "../../../domain/dto/libro/request/GetLibroDisponibilidadReq";
import { type GetLibroDisponibilidadRes, type LibroDisponibilidadSedeItem } from "../../../domain/dto/libro/response/GetLibroDisponibilidadRes";
import { type CreateLibroReq } from "../../../domain/dto/libro/request/CreateLibroReq";
import { type CreateLibroRes } from "../../../domain/dto/libro/response/CreateLibroRes";
import { type UpdateLibroReq } from "../../../domain/dto/libro/request/UpdateLibroReq";
import { type UpdateLibroRes } from "../../../domain/dto/libro/response/UpdateLibroRes";
import { type DeleteLibroReq } from "../../../domain/dto/libro/request/DeleteLibroReq";
import { HTTPClient } from "../../../core/adapters/http-client";
import { CacheTags, withCacheTags } from "../../../core/config/cache";
import { ErrorHandler } from "@/domain/messages";

export class LibroApiDataSource implements LibroDataSourceI {

    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async getAllLibros(dto: GetAllLibrosReq): Promise<GetAllLibrosRes> {
        try {
            const filters = dto.filters ?? LibroFilters.fromObject(dto);
            const params = filters.toApiParams();

            const response = await this.httpClient.get(
                "/libros",
                params,
                dto.session?.accessToken,
                withCacheTags(CacheTags.LIBROS)
            );

            const list = Array.isArray(response)
                ? response
                : (response?.libros || response?.items || response?.data || []);

            return {
                libros: Libro.fromList(list),
                total: response?.total ?? response?.totalElements ?? list.length ?? 0
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getLibroById(dto: GetLibroByIdReq): Promise<GetLibroByIdRes> {
        try {
            const response = await this.httpClient.get(
                `/libros/${dto.id}`,
                {},
                dto.session?.accessToken,
                withCacheTags(CacheTags.LIBROS, CacheTags.libroDetail(dto.id))
            );

            return {
                libro: Libro.fromObject(response?.libro || response)!
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getLibroDisponibilidad(dto: GetLibroDisponibilidadReq): Promise<GetLibroDisponibilidadRes> {
        try {
            const response = await this.httpClient.get(
                `/libros/${dto.id}/disponibilidad`,
                {},
                dto.session?.accessToken,
                withCacheTags(CacheTags.LIBROS, CacheTags.libroDisponibilidad(dto.id))
            );

            const rawSedes = Array.isArray(response)
                ? response
                : (response?.sedes || response?.disponibilidad || []);

            const sedes: LibroDisponibilidadSedeItem[] = rawSedes.map((item: any) => {
                const sedeEntity = item.sede ? Sede.fromObject(item.sede) : null;
                return {
                    sedeId: String(item.sedeId ?? item.sede_id ?? sedeEntity?.id ?? ""),
                    sedeNombre: String(item.sedeNombre ?? item.sede_nombre ?? item.nombre ?? sedeEntity?.nombre ?? ""),
                    sede: sedeEntity,
                    ejemplares: Ejemplar.fromList(item.ejemplares || [])
                };
            });

            return {
                libroId: String(response?.libroId ?? response?.libro_id ?? dto.id),
                sedes
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async createLibro(dto: CreateLibroReq): Promise<CreateLibroRes> {
        try {
            const response = await this.httpClient.post(
                "/libros",
                {
                    titulo: dto.titulo,
                    añoPublicacion: dto.añoPublicacion,
                    editorial: dto.editorial,
                    edicion: dto.edicion,
                    ...(dto.autoresIds ? { autoresIds: dto.autoresIds } : {})
                },
                dto.session?.accessToken
            );

            const libro = Libro.fromObject(response?.libro || response);

            return {
                id: String(response?.id || response?.libro?.id || libro?.id || ""),
                libro
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async updateLibro(dto: UpdateLibroReq): Promise<UpdateLibroRes> {
        try {
            const payload: Record<string, any> = {};

            if (dto.titulo !== undefined) payload.titulo = dto.titulo;
            if (dto.añoPublicacion !== undefined) payload.añoPublicacion = dto.añoPublicacion;
            if (dto.editorial !== undefined) payload.editorial = dto.editorial;
            if (dto.edicion !== undefined) payload.edicion = dto.edicion;

            const response = await this.httpClient.put(
                `/libros/${dto.id}`,
                payload,
                dto.session?.accessToken
            );

            const libro = Libro.fromObject(response?.libro || response);

            return {
                id: String(response?.id || response?.libro?.id || dto.id),
                libro
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async deleteLibro(dto: DeleteLibroReq): Promise<void> {
        try {
            await this.httpClient.delete(
                `/libros/${dto.id}`,
                {},
                dto.session?.accessToken
            );
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

}
