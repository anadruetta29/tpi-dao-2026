import { AutorDataSourceI } from "../../../domain/datasources/autor";
import { Autor } from "../../../domain/entities/autor";
import { type GetAllAutoresReq } from "../../../domain/dto/autor/request/GetAllAutoresReq";
import { type GetAllAutoresRes } from "../../../domain/dto/autor/response/GetAllAutoresRes";
import { type CreateAutorReq } from "../../../domain/dto/autor/request/CreateAutorReq";
import { type CreateAutorRes } from "../../../domain/dto/autor/response/CreateAutorRes";
import { HTTPClient } from "../../../core/adapters/http-client";
import { CacheTags, withCacheTags } from "../../../core/config/cache";
import { ErrorHandler } from "@/domain/messages";

export class AutorApiDataSource implements AutorDataSourceI {

    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async getAllAutores(dto: GetAllAutoresReq): Promise<GetAllAutoresRes> {
        try {
            const response = await this.httpClient.get(
                "/autores",
                {},
                dto.session?.accessToken,
                withCacheTags(CacheTags.AUTORES)
            );

            const list = Array.isArray(response)
                ? response
                : (response?.autores || response?.items || response?.data || []);

            return {
                autores: Autor.fromList(list),
                total: response?.total ?? response?.totalElements ?? list.length ?? 0
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async createAutor(dto: CreateAutorReq): Promise<CreateAutorRes> {
        try {
            const response = await this.httpClient.post(
                "/autores",
                {
                    nombre: dto.nombre,
                    apellido: dto.apellido
                },
                dto.session?.accessToken
            );

            const autor = Autor.fromObject(response?.autor || response);

            return {
                id: String(response?.id || response?.autor?.id || autor?.id || ""),
                autor
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

}
