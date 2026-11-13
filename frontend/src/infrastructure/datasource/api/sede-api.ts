import { SedeDataSourceI } from "../../../domain/datasources/sede";
import { Sede } from "../../../domain/entities/sede";
import { type GetAllSedesReq } from "../../../domain/dto/sede/request/GetAllSedesReq";
import { type GetAllSedesRes } from "../../../domain/dto/sede/response/GetAllSedesRes";
import { type GetSedeByIdReq } from "../../../domain/dto/sede/request/GetSedeByIdReq";
import { type GetSedeByIdRes } from "../../../domain/dto/sede/response/GetSedeByIdRes";
import { type CreateSedeReq } from "../../../domain/dto/sede/request/CreateSedeReq";
import { type UpdateSedeReq } from "../../../domain/dto/sede/request/UpdateSedeReq";
import { type DeleteSedeReq } from "../../../domain/dto/sede/request/DeleteSedeReq";
import { HTTPClient } from "../../../core/adapters/http-client";
import { CacheTags, withCacheTags } from "../../../core/config/cache";
import { ErrorHandler, ErrorMessages } from "@/domain/messages";

export class SedeApiDataSource implements SedeDataSourceI {

    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async getAllSedes(dto: GetAllSedesReq): Promise<GetAllSedesRes> {
        try {
            const response = await this.httpClient.get(
                "/sedes",
                { estado: dto.estado?.getValue() },
                dto.session.accessToken,
                withCacheTags(CacheTags.SEDES)
            );

            return {
                sedes: Sede.fromList(response?.sedes || response)
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getSedeById(dto: GetSedeByIdReq): Promise<GetSedeByIdRes> {
        try {
            const response = await this.httpClient.get(
                `/sedes/${encodeURIComponent(dto.id)}`,
                {},
                dto.session.accessToken,
                withCacheTags(CacheTags.SEDES)
            );
            const sede = Sede.fromObject(response?.sede || response);
            if (!sede?.id) {
                throw new Error(ErrorMessages.SEDE_DETAIL_ERROR);
            }

            return { sede };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async createSede(dto: CreateSedeReq): Promise<void> {
        try {
            await this.httpClient.post("/sedes", {
                nombre: dto.nombre,
                telefono: dto.telefono,
                email: dto.email,
                horarioAtencion: dto.horarioAtencion
            }, dto.session.accessToken);
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async updateSede(dto: UpdateSedeReq): Promise<void> {
        try {
            await this.httpClient.put(`/sedes/${encodeURIComponent(dto.id)}`, {
                nombre: dto.nombre,
                telefono: dto.telefono,
                email: dto.email,
                horarioAtencion: dto.horarioAtencion
            }, dto.session.accessToken);
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async deleteSede(dto: DeleteSedeReq): Promise<void> {
        try {
            await this.httpClient.delete(`/sedes/${encodeURIComponent(dto.id)}`, {}, dto.session.accessToken);
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

}
