import { AuthDataSourceI } from "../../../domain/datasources/auth";
import { Usuario } from "../../../domain/entities/usuario";
import { type LoginReq } from "../../../domain/dto/auth/request/LoginReq";
import { type LoginRes } from "../../../domain/dto/auth/response/LoginRes";
import { type GetCurrentUserReq } from "../../../domain/dto/auth/request/GetCurrentUserReq";
import { type GetCurrentUserRes } from "../../../domain/dto/auth/response/GetCurrentUserRes";
import { HTTPClient } from "../../../core/adapters/http-client";
import { CacheTags, withCacheTags } from "../../../core/config/cache";
import { ErrorHandler } from "@/domain/messages";

export class AuthApiDataSource implements AuthDataSourceI {

    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async login(dto: LoginReq): Promise<LoginRes> {
        try {
            const response = await this.httpClient.post("/auth/login", {
                email: dto.email,
                password: dto.password
            });

            return {
                accessToken: response?.accessToken || response?.access_token || response?.token || "",
                user: Usuario.fromObject(response?.user || response?.usuario || response)!
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getCurrentUser(dto: GetCurrentUserReq): Promise<GetCurrentUserRes> {
        try {
            const response = await this.httpClient.get(
                "/auth/me",
                {},
                dto.session?.accessToken,
                withCacheTags(CacheTags.AUTH_ME)
            );

            return {
                user: Usuario.fromObject(response?.user || response?.usuario || response)!
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

}
