import { HTTPClient } from "@/core/adapters/http-client";
import { CacheTags, withCacheTags } from "@/core/config/cache";
import { type DevolucionDataSourceI } from "@/domain/datasources/devolucion";
import { Devolucion } from "@/domain/entities/devolucion";
import { type GetAllDevolucionesReq } from "@/domain/dto/devolucion/request/GetAllDevolucionesReq";
import { type GetAllDevolucionesRes } from "@/domain/dto/devolucion/response/GetAllDevolucionesRes";
import { type GetDevolucionByIdReq } from "@/domain/dto/devolucion/request/GetDevolucionByIdReq";
import { type GetDevolucionByIdRes } from "@/domain/dto/devolucion/response/GetDevolucionByIdRes";
import { type CreateDevolucionReq } from "@/domain/dto/devolucion/request/CreateDevolucionReq";
import { type CreateDevolucionRes } from "@/domain/dto/devolucion/response/CreateDevolucionRes";
import { ErrorHandler, ErrorMessages } from "@/domain/messages";

export class DevolucionApiDataSource implements DevolucionDataSourceI {

    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async getAllDevoluciones(dto: GetAllDevolucionesReq): Promise<GetAllDevolucionesRes> {
        try {
            const response = await this.httpClient.get(
                "/devoluciones",
                {},
                dto.session.accessToken,
                withCacheTags(CacheTags.DEVOLUCIONES)
            );

            return { devoluciones: Devolucion.fromList(response?.devoluciones ?? response) };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getDevolucionById(dto: GetDevolucionByIdReq): Promise<GetDevolucionByIdRes> {
        try {
            const response = await this.httpClient.get(
                `/devoluciones/${encodeURIComponent(dto.id)}`,
                {},
                dto.session.accessToken,
                withCacheTags(CacheTags.DEVOLUCIONES)
            );

            const devolucion = Devolucion.fromObject(response?.devolucion ?? response);
            if (!devolucion?.id) {
                throw new Error(ErrorMessages.GET_DEVOLUCION_BY_ID_ERROR);
            }

            return { devolucion };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async createDevolucion(dto: CreateDevolucionReq): Promise<CreateDevolucionRes> {
        try {
            const response = await this.httpClient.post(
                "/devoluciones",
                {
                    prestamo_id: Number(dto.prestamoId),
                    fecha: dto.fecha,
                    observaciones: dto.observaciones,
                    estadoDevuelto: dto.estadoDevuelto.getValue()
                },
                dto.session.accessToken
            );

            const devolucion = Devolucion.fromObject(response?.devolucion ?? response);
            if (!devolucion?.id) {
                throw new Error(ErrorMessages.CREATE_DEVOLUCION_ERROR);
            }

            return { devolucion };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

}
