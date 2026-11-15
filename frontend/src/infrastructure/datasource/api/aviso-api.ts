import { HTTPClient } from "@/core/adapters/http-client";
import { CacheTags, withCacheTags } from "@/core/config/cache";
import { AvisoDataSourceI } from "@/domain/datasources/aviso";
import { Aviso } from "@/domain/entities/aviso";
import { type Session } from "@/domain/entities/session";
import { ErrorHandler, ErrorMessages } from "@/domain/messages";

export class AvisoApiDataSource implements AvisoDataSourceI {
    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async getAllAvisos(session: Session): Promise<{ avisos: Aviso[] }> {
        try {
            const response = await this.httpClient.get(
                "/avisos",
                {},
                session.accessToken,
                withCacheTags(CacheTags.AVISOS)
            );
            return { avisos: Aviso.fromList(response?.avisos ?? response) };
        } catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async marcarLeido(id: string, session: Session): Promise<{ aviso: Aviso }> {
        try {
            const response = await this.httpClient.patch(
                `/avisos/${encodeURIComponent(id)}/lectura`,
                {},
                session.accessToken
            );
            const aviso = Aviso.fromObject(response?.aviso ?? response);
            if (!aviso?.id) {
                throw new Error(ErrorMessages.UNEXPECTED_ERROR);
            }
            return { aviso };
        } catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }
}
