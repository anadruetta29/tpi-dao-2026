import { EjemplarDataSourceI } from "../../../domain/datasources/ejemplar";
import { Ejemplar, EstadoEjemplar } from "../../../domain/entities/ejemplar";
import { EjemplarFilters } from "../../../domain/filters/ejemplar-filters";
import { type GetAllEjemplaresReq } from "../../../domain/dto/ejemplar/request/GetAllEjemplaresReq";
import { type GetAllEjemplaresRes } from "../../../domain/dto/ejemplar/response/GetAllEjemplaresRes";
import { type GetEjemplarByIdReq } from "../../../domain/dto/ejemplar/request/GetEjemplarByIdReq";
import { type GetEjemplarByIdRes } from "../../../domain/dto/ejemplar/response/GetEjemplarByIdRes";
import { type CreateEjemplarReq } from "../../../domain/dto/ejemplar/request/CreateEjemplarReq";
import { type CreateEjemplarRes } from "../../../domain/dto/ejemplar/response/CreateEjemplarRes";
import { HTTPClient } from "../../../core/adapters/http-client";
import { CacheTags, withCacheTags } from "../../../core/config/cache";
import { ErrorHandler } from "@/domain/messages";

export class EjemplarApiDataSource implements EjemplarDataSourceI {

    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async getAllEjemplares(dto: GetAllEjemplaresReq): Promise<GetAllEjemplaresRes> {
        try {
            const filters = dto.filters ?? EjemplarFilters.fromObject(dto);
            const params = filters.toApiParams();

            const response = await this.httpClient.get(
                "/ejemplares",
                params,
                dto.session?.accessToken,
                withCacheTags(CacheTags.EJEMPLARES)
            );

            const list = Array.isArray(response)
                ? response
                : (response?.ejemplares || response?.items || response?.data || []);

            return {
                ejemplares: Ejemplar.fromList(list),
                total: response?.total ?? response?.totalElements ?? list.length ?? 0
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getEjemplarById(dto: GetEjemplarByIdReq): Promise<GetEjemplarByIdRes> {
        try {
            const response = await this.httpClient.get(
                `/ejemplares/${dto.id}`,
                {},
                dto.session?.accessToken,
                withCacheTags(CacheTags.EJEMPLARES, CacheTags.ejemplarDetail(dto.id))
            );

            return {
                ejemplar: Ejemplar.fromObject(response?.ejemplar || response)!
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async createEjemplar(dto: CreateEjemplarReq): Promise<CreateEjemplarRes> {
        try {
            const estadoValue = dto.estado instanceof EstadoEjemplar
                ? dto.estado.value
                : (dto.estado || EstadoEjemplar.DISPONIBLE.value);

            const response = await this.httpClient.post(
                "/ejemplares",
                {
                    codigo: dto.codigo,
                    libro_id: dto.libro_id,
                    sede_id: dto.sede_id,
                    estado: estadoValue
                },
                dto.session?.accessToken
            );

            const ejemplar = Ejemplar.fromObject(response?.ejemplar || response);

            return {
                id: String(response?.id || response?.ejemplar?.id || ejemplar?.id || ""),
                ejemplar
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

}
