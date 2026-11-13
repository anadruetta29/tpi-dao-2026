import { HTTPClient } from "@/core/adapters/http-client";
import { CacheTags, withCacheTags } from "@/core/config/cache";
import { type ReservaDataSourceI } from "@/domain/datasources/reserva";
import { Reserva } from "@/domain/entities/reserva";
import { ReservaFilters } from "@/domain/filters/reserva-filters";
import { type GetAllReservasReq } from "@/domain/dto/reserva/request/GetAllReservasReq";
import { type GetAllReservasRes } from "@/domain/dto/reserva/response/GetAllReservasRes";
import { type GetReservaByIdReq } from "@/domain/dto/reserva/request/GetReservaByIdReq";
import { type GetReservaByIdRes } from "@/domain/dto/reserva/response/GetReservaByIdRes";
import { type CreateReservaReq } from "@/domain/dto/reserva/request/CreateReservaReq";
import { type CreateReservaRes } from "@/domain/dto/reserva/response/CreateReservaRes";
import { type UpdateReservaEstadoReq } from "@/domain/dto/reserva/request/UpdateReservaEstadoReq";
import { type UpdateReservaEstadoRes } from "@/domain/dto/reserva/response/UpdateReservaEstadoRes";
import { ErrorHandler, ErrorMessages } from "@/domain/messages";

export class ReservaApiDataSource implements ReservaDataSourceI {

    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async getAllReservas(dto: GetAllReservasReq): Promise<GetAllReservasRes> {
        try {
            const response = await this.httpClient.get(
                "/reservas",
                new ReservaFilters(dto.libroId, dto.socioId, dto.sedeId, dto.estado).toApiParams(),
                dto.session.accessToken,
                withCacheTags(CacheTags.RESERVAS)
            );

            return { reservas: Reserva.fromList(response?.reservas ?? response) };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getReservaById(dto: GetReservaByIdReq): Promise<GetReservaByIdRes> {
        try {
            const response = await this.httpClient.get(
                `/reservas/${encodeURIComponent(dto.id)}`,
                {},
                dto.session.accessToken,
                withCacheTags(CacheTags.RESERVAS)
            );

            const reserva = Reserva.fromObject(response?.reserva ?? response);
            if (!reserva?.id) {
                throw new Error(ErrorMessages.GET_RESERVA_BY_ID_ERROR);
            }

            return { reserva };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async createReserva(dto: CreateReservaReq): Promise<CreateReservaRes> {
        try {
            const response = await this.httpClient.post(
                "/reservas",
                {
                    socio_id: Number(dto.socioId),
                    libro_id: dto.libroId ? Number(dto.libroId) : undefined,
                    ejemplar_id: dto.ejemplarId ? Number(dto.ejemplarId) : undefined,
                    sede_id: dto.sedeId ? Number(dto.sedeId) : undefined,
                    fecha: dto.fecha
                },
                dto.session.accessToken
            );

            const reserva = Reserva.fromObject(response?.reserva ?? response);
            if (!reserva?.id) {
                throw new Error(ErrorMessages.CREATE_RESERVA_ERROR);
            }

            return { reserva };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async updateReservaEstado(dto: UpdateReservaEstadoReq): Promise<UpdateReservaEstadoRes> {
        try {
            const response = await this.httpClient.patch(
                `/reservas/${encodeURIComponent(dto.id)}/estado`,
                {
                    estado: dto.estado.getValue()
                },
                dto.session.accessToken
            );

            const reserva = Reserva.fromObject(response?.reserva ?? response);
            if (!reserva?.id) {
                throw new Error(ErrorMessages.UPDATE_RESERVA_ESTADO_ERROR);
            }

            return { reserva };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

}
