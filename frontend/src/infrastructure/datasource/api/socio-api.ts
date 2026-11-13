import { HTTPClient } from "@/core/adapters/http-client";
import { CacheTags, withCacheTags } from "@/core/config/cache";
import { type SocioDataSourceI } from "@/domain/datasources/socio";
import { Socio } from "@/domain/entities/socio";
import { Prestamo } from "@/domain/entities/prestamo";
import { Multa } from "@/domain/entities/multa";
import { SocioFilters } from "@/domain/filters/socio-filters";
import { type GetAllSociosReq } from "@/domain/dto/socio/request/GetAllSociosReq";
import { type GetAllSociosRes } from "@/domain/dto/socio/response/GetAllSociosRes";
import { type GetSocioByIdReq } from "@/domain/dto/socio/request/GetSocioByIdReq";
import { type GetSocioByIdRes } from "@/domain/dto/socio/response/GetSocioByIdRes";
import { type GetSocioPrestamosReq } from "@/domain/dto/socio/request/GetSocioPrestamosReq";
import { type GetSocioPrestamosRes } from "@/domain/dto/socio/response/GetSocioPrestamosRes";
import { type GetSocioMultasReq } from "@/domain/dto/socio/request/GetSocioMultasReq";
import { type GetSocioMultasRes } from "@/domain/dto/socio/response/GetSocioMultasRes";
import { type CreateSocioReq } from "@/domain/dto/socio/request/CreateSocioReq";
import { type CreateSocioRes } from "@/domain/dto/socio/response/CreateSocioRes";
import { type UpdateSocioReq } from "@/domain/dto/socio/request/UpdateSocioReq";
import { type UpdateSocioRes } from "@/domain/dto/socio/response/UpdateSocioRes";
import { type DeleteSocioReq } from "@/domain/dto/socio/request/DeleteSocioReq";
import { ErrorHandler, ErrorMessages } from "@/domain/messages";

export class SocioApiDataSource implements SocioDataSourceI {

    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async getAllSocios(dto: GetAllSociosReq): Promise<GetAllSociosRes> {
        try {
            const response = await this.httpClient.get(
                "/socios",
                new SocioFilters(dto.q, dto.documento, dto.estado).toApiParams(),
                dto.session.accessToken,
                withCacheTags(CacheTags.SOCIOS)
            );

            return { socios: Socio.fromList(response?.socios ?? response) };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getSocioById(dto: GetSocioByIdReq): Promise<GetSocioByIdRes> {
        try {
            const response = await this.httpClient.get(
                `/socios/${encodeURIComponent(dto.id)}`,
                {},
                dto.session.accessToken,
                withCacheTags(CacheTags.SOCIOS)
            );

            const socio = Socio.fromObject(response?.socio ?? response);
            if (!socio?.id) {
                throw new Error(ErrorMessages.GET_SOCIO_BY_ID_ERROR);
            }

            return { socio };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getSocioPrestamos(dto: GetSocioPrestamosReq): Promise<GetSocioPrestamosRes> {
        try {
            const response = await this.httpClient.get(
                `/socios/${encodeURIComponent(dto.id)}/prestamos`,
                {},
                dto.session.accessToken,
                withCacheTags(CacheTags.SOCIOS, CacheTags.PRESTAMOS)
            );

            return { prestamos: Prestamo.fromList(response?.prestamos ?? response) };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getSocioMultas(dto: GetSocioMultasReq): Promise<GetSocioMultasRes> {
        try {
            const response = await this.httpClient.get(
                `/socios/${encodeURIComponent(dto.id)}/multas`,
                {},
                dto.session.accessToken,
                withCacheTags(CacheTags.SOCIOS, CacheTags.MULTAS)
            );

            return { multas: Multa.fromList(response?.multas ?? response) };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async createSocio(dto: CreateSocioReq): Promise<CreateSocioRes> {
        try {
            const response = await this.httpClient.post(
                "/socios",
                {
                    nombre: dto.nombre,
                    apellido: dto.apellido,
                    documento: dto.documento,
                    email: dto.email,
                    telefono: dto.telefono
                },
                dto.session.accessToken
            );

            const socio = Socio.fromObject(response?.socio ?? response);
            if (!socio?.id) {
                throw new Error(ErrorMessages.CREATE_SOCIO_ERROR);
            }

            return { socio };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async updateSocio(dto: UpdateSocioReq): Promise<UpdateSocioRes> {
        try {
            const response = await this.httpClient.put(
                `/socios/${encodeURIComponent(dto.id)}`,
                {
                    nombre: dto.nombre,
                    apellido: dto.apellido,
                    documento: dto.documento,
                    email: dto.email,
                    telefono: dto.telefono
                },
                dto.session.accessToken
            );

            const socio = Socio.fromObject(response?.socio ?? response);
            if (!socio?.id) {
                throw new Error(ErrorMessages.UPDATE_SOCIO_ERROR);
            }

            return { socio };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async deleteSocio(dto: DeleteSocioReq): Promise<void> {
        try {
            await this.httpClient.delete(
                `/socios/${encodeURIComponent(dto.id)}`,
                {},
                dto.session.accessToken
            );
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

}
