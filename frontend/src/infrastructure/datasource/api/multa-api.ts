import { MultaDataSourceI } from "@/domain/datasources/multa";
import { Multa, MotivoMulta, EstadoMulta } from "@/domain/entities/multa";
import { MultaFilters } from "@/domain/filters/multa-filters";
import { type GetAllMultasReq } from "@/domain/dto/multa/request/GetAllMultasReq";
import { type GetAllMultasRes } from "@/domain/dto/multa/response/GetAllMultasRes";
import { type GetMultaByIdReq } from "@/domain/dto/multa/request/GetMultaByIdReq";
import { type GetMultaByIdRes } from "@/domain/dto/multa/response/GetMultaByIdRes";
import { type CreateMultaReq } from "@/domain/dto/multa/request/CreateMultaReq";
import { type CreateMultaRes } from "@/domain/dto/multa/response/CreateMultaRes";
import { type PagarMultaReq } from "@/domain/dto/multa/request/PagarMultaReq";
import { type PagarMultaRes } from "@/domain/dto/multa/response/PagarMultaRes";
import { type AnularMultaReq } from "@/domain/dto/multa/request/AnularMultaReq";
import { type AnularMultaRes } from "@/domain/dto/multa/response/AnularMultaRes";
import { HTTPClient } from "@/core/adapters/http-client";
import { CacheTags, withCacheTags } from "@/core/config/cache";
import { ErrorHandler } from "@/domain/messages";

export class MultaApiDataSource implements MultaDataSourceI {

    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async getAllMultas(dto: GetAllMultasReq): Promise<GetAllMultasRes> {
        try {
            const filters = dto.filters ?? MultaFilters.fromObject(dto);
            const params = filters.toApiParams();

            const response = await this.httpClient.get(
                "/multas",
                params,
                dto.session?.accessToken,
                withCacheTags(CacheTags.MULTAS)
            );

            const list = Array.isArray(response)
                ? response
                : (response?.multas || response?.items || response?.data || []);

            return {
                multas: Multa.fromList(list),
                total: response?.total ?? response?.totalElements ?? list.length ?? 0
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getMultaById(dto: GetMultaByIdReq): Promise<GetMultaByIdRes> {
        try {
            const response = await this.httpClient.get(
                `/multas/${dto.id}`,
                {},
                dto.session?.accessToken,
                withCacheTags(CacheTags.MULTAS, CacheTags.multaDetail(dto.id))
            );

            return {
                multa: Multa.fromObject(response?.multa || response)!
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async createMulta(dto: CreateMultaReq): Promise<CreateMultaRes> {
        try {
            const motivoValue = dto.motivo instanceof MotivoMulta
                ? dto.motivo.value
                : dto.motivo;

            const estadoValue = dto.estado instanceof EstadoMulta
                ? dto.estado.value
                : (dto.estado || EstadoMulta.PENDIENTE.value);

            const response = await this.httpClient.post(
                "/multas",
                {
                    socio_id: dto.socio_id,
                    prestamo_id: dto.prestamo_id,
                    motivo: motivoValue,
                    monto: dto.monto,
                    estado: estadoValue
                },
                dto.session?.accessToken
            );

            const multa = Multa.fromObject(response?.multa || response);

            return {
                id: String(response?.id || response?.multa?.id || multa?.id || ""),
                multa
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async pagarMulta(dto: PagarMultaReq): Promise<PagarMultaRes> {
        try {
            const payload: Record<string, any> = {};
            if (dto.fechaPago) payload.fechaPago = dto.fechaPago;

            const response = await this.httpClient.patch(
                `/multas/${dto.id}/pagar`,
                payload,
                dto.session?.accessToken
            );

            const multa = Multa.fromObject(response?.multa || response);

            return {
                id: String(response?.id || response?.multa?.id || dto.id),
                multa
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async anularMulta(dto: AnularMultaReq): Promise<AnularMultaRes> {
        try {
            const response = await this.httpClient.patch(
                `/multas/${dto.id}/anular`,
                {},
                dto.session?.accessToken
            );

            const multa = Multa.fromObject(response?.multa || response);

            return {
                id: String(response?.id || response?.multa?.id || dto.id),
                multa
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

}
