import { PrestamoDataSourceI } from "@/domain/datasources/prestamo";
import { Prestamo, EstadoPrestamo, ModalidadPrestamoLocal } from "@/domain/entities/prestamo";
import { PrestamoFilters } from "@/domain/filters/prestamo-filters";
import { type GetAllPrestamosReq } from "@/domain/dto/prestamo/request/GetAllPrestamosReq";
import { type GetAllPrestamosRes } from "@/domain/dto/prestamo/response/GetAllPrestamosRes";
import { type GetPrestamoByIdReq } from "@/domain/dto/prestamo/request/GetPrestamoByIdReq";
import { type GetPrestamoByIdRes } from "@/domain/dto/prestamo/response/GetPrestamoByIdRes";
import { type CreatePrestamoReq } from "@/domain/dto/prestamo/request/CreatePrestamoReq";
import { type CreatePrestamoRes } from "@/domain/dto/prestamo/response/CreatePrestamoRes";
import { HTTPClient } from "@/core/adapters/http-client";
import { CacheTags, withCacheTags } from "@/core/config/cache";
import { ErrorHandler } from "@/domain/messages";

export class PrestamoApiDataSource implements PrestamoDataSourceI {

    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async getAllPrestamos(dto: GetAllPrestamosReq): Promise<GetAllPrestamosRes> {
        try {
            const filters = dto.filters ?? PrestamoFilters.fromObject(dto);
            const params = filters.toApiParams();

            const response = await this.httpClient.get(
                "/prestamos",
                params,
                dto.session?.accessToken,
                withCacheTags(CacheTags.PRESTAMOS)
            );

            const list = Array.isArray(response)
                ? response
                : (response?.prestamos || response?.items || response?.data || []);

            return {
                prestamos: Prestamo.fromList(list),
                total: response?.total ?? response?.totalElements ?? list.length ?? 0
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getPrestamoById(dto: GetPrestamoByIdReq): Promise<GetPrestamoByIdRes> {
        try {
            const response = await this.httpClient.get(
                `/prestamos/${dto.id}`,
                {},
                dto.session?.accessToken,
                withCacheTags(CacheTags.PRESTAMOS, CacheTags.prestamoDetail(dto.id))
            );

            return {
                prestamo: Prestamo.fromObject(response?.prestamo || response)!
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async createPrestamo(dto: CreatePrestamoReq): Promise<CreatePrestamoRes> {
        try {
            const modalidadValue = dto.modalidad instanceof ModalidadPrestamoLocal
                ? dto.modalidad.value
                : dto.modalidad;

            const estadoValue = dto.estado instanceof EstadoPrestamo
                ? dto.estado.value
                : (dto.estado || EstadoPrestamo.ACTIVO.value);

            const payload: Record<string, any> = {
                solicitud_id: dto.solicitud_id,
                modalidad: modalidadValue,
                estado: estadoValue
            };

            if (dto.fechaInicio) payload.fechaInicio = dto.fechaInicio;
            if (dto.fechaVencimiento) payload.fechaVencimiento = dto.fechaVencimiento;

            const response = await this.httpClient.post(
                "/prestamos",
                payload,
                dto.session?.accessToken
            );

            const prestamo = Prestamo.fromObject(response?.prestamo || response);

            return {
                id: String(response?.id || response?.prestamo?.id || prestamo?.id || ""),
                prestamo
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

}
