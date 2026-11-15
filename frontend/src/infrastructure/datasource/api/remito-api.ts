import { RemitoDataSourceI } from "@/domain/datasources/remito";
import { Remito } from "@/domain/entities/remito";
import { Ejemplar } from "@/domain/entities/ejemplar";
import { HistorialEstadoRemito } from "@/domain/entities/historial-estado-remito";
import { RemitoFilters } from "@/domain/filters/remito-filters";
import { type GetAllRemitosReq } from "@/domain/dto/remito/request/GetAllRemitosReq";
import { type GetAllRemitosRes } from "@/domain/dto/remito/response/GetAllRemitosRes";
import { type GetRemitoByIdReq } from "@/domain/dto/remito/request/GetRemitoByIdReq";
import { type GetRemitoByIdRes } from "@/domain/dto/remito/response/GetRemitoByIdRes";
import { type CreateRemitoReq } from "@/domain/dto/remito/request/CreateRemitoReq";
import { type CreateRemitoRes } from "@/domain/dto/remito/response/CreateRemitoRes";
import { type RegistrarDespachoRemitoReq } from "@/domain/dto/remito/request/RegistrarDespachoRemitoReq";
import { type RegistrarEmpaqueRemitoReq } from "@/domain/dto/remito/request/RegistrarEmpaqueRemitoReq";
import { type RegistrarEmpaqueRemitoRes } from "@/domain/dto/remito/response/RegistrarEmpaqueRemitoRes";
import { type RegistrarDespachoRemitoRes } from "@/domain/dto/remito/response/RegistrarDespachoRemitoRes";
import { type RegistrarRecepcionRemitoReq } from "@/domain/dto/remito/request/RegistrarRecepcionRemitoReq";
import { type RegistrarRecepcionRemitoRes } from "@/domain/dto/remito/response/RegistrarRecepcionRemitoRes";
import { type GetTrazabilidadRemitoReq } from "@/domain/dto/remito/request/GetTrazabilidadRemitoReq";
import { type GetTrazabilidadRemitoRes } from "@/domain/dto/remito/response/GetTrazabilidadRemitoRes";
import { HTTPClient } from "@/core/adapters/http-client";
import { CacheTags, withCacheTags } from "@/core/config/cache";
import { ErrorHandler } from "@/domain/messages";

export class RemitoApiDataSource implements RemitoDataSourceI {

    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async getAllRemitos(dto: GetAllRemitosReq): Promise<GetAllRemitosRes> {
        try {
            const filters = dto.filters ?? RemitoFilters.fromObject(dto);
            const params = filters.toApiParams();

            const response = await this.httpClient.get(
                "/remitos",
                params,
                dto.session?.accessToken,
                withCacheTags(CacheTags.REMITOS)
            );

            const list = Array.isArray(response)
                ? response
                : (response?.remitos || response?.items || response?.data || []);

            return {
                remitos: Remito.fromList(list),
                total: response?.total ?? response?.totalElements ?? list.length ?? 0
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getRemitoById(dto: GetRemitoByIdReq): Promise<GetRemitoByIdRes> {
        try {
            const response = await this.httpClient.get(
                `/remitos/${dto.id}`,
                {},
                dto.session?.accessToken,
                withCacheTags(CacheTags.REMITOS, CacheTags.remitoDetail(dto.id))
            );

            return {
                remito: Remito.fromObject(response?.remito || response)!,
                ejemplares: Ejemplar.fromList(response?.ejemplares || response?.remito?.ejemplares || [])
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async createRemito(dto: CreateRemitoReq): Promise<CreateRemitoRes> {
        try {
            const payload: Record<string, any> = {
                ejemplar_ids: dto.ejemplaresIds.map(Number)
            };

            if (dto.sede_origen_id) payload.sede_origen_id = Number(dto.sede_origen_id);
            if (dto.sede_destino_id) payload.sede_destino_id = Number(dto.sede_destino_id);
            if (dto.fechaEmision) payload.fechaEmision = dto.fechaEmision;

            const response = await this.httpClient.post(
                "/remitos",
                payload,
                dto.session?.accessToken
            );

            const remito = Remito.fromObject(response?.remito || response);

            return {
                id: String(response?.id || response?.remito?.id || remito?.id || ""),
                remito
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async registrarEmpaque(dto: RegistrarEmpaqueRemitoReq): Promise<RegistrarEmpaqueRemitoRes> {
        try {
            const response = await this.httpClient.patch(
                `/remitos/${encodeURIComponent(dto.id)}/empaque`,
                {},
                dto.session.accessToken
            );

            const remito = Remito.fromObject(response?.remito || response);
            return { id: remito?.id || dto.id, remito };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async registrarDespacho(dto: RegistrarDespachoRemitoReq): Promise<RegistrarDespachoRemitoRes> {
        try {
            const payload: Record<string, any> = {};
            if (dto.fechaDespacho) payload.fechaDespacho = dto.fechaDespacho;

            const response = await this.httpClient.patch(
                `/remitos/${dto.id}/despacho`,
                payload,
                dto.session?.accessToken
            );

            const remito = Remito.fromObject(response?.remito || response);

            return {
                id: String(response?.id || response?.remito?.id || dto.id),
                remito
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async registrarRecepcion(dto: RegistrarRecepcionRemitoReq): Promise<RegistrarRecepcionRemitoRes> {
        try {
            const payload: Record<string, any> = {};
            if (dto.fechaRecepcion) payload.fechaRecepcion = dto.fechaRecepcion;
            if (dto.conIncidencia !== undefined) payload.con_incidencia = dto.conIncidencia;

            const response = await this.httpClient.patch(
                `/remitos/${dto.id}/recepcion`,
                payload,
                dto.session?.accessToken
            );

            const remito = Remito.fromObject(response?.remito || response);

            return {
                id: String(response?.id || response?.remito?.id || dto.id),
                remito
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getTrazabilidad(dto: GetTrazabilidadRemitoReq): Promise<GetTrazabilidadRemitoRes> {
        try {
            const response = await this.httpClient.get(
                `/remitos/${dto.id}/trazabilidad`,
                {},
                dto.session?.accessToken,
                withCacheTags(CacheTags.REMITOS, CacheTags.remitoTrazabilidad(dto.id))
            );

            const list = Array.isArray(response)
                ? response
                : (response?.historial || response?.trazabilidad || response?.items || []);

            return {
                remitoId: String(response?.remitoId ?? response?.remito_id ?? dto.id),
                historial: HistorialEstadoRemito.fromList(list)
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

}
