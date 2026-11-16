import { HTTPClient } from "@/core/adapters/http-client";
import { CacheTags, withCacheTags } from "@/core/config/cache";
import { ConfiguracionDataSourceI } from "@/domain/datasources/configuracion";
import { MotivoMulta } from "@/domain/entities/motivo-multa";
import { TarifaMulta } from "@/domain/entities/tarifa-multa";
import { type GetAllTarifasMultaReq } from "@/domain/dto/configuracion/request/GetAllTarifasMultaReq";
import { type UpdateTarifaMultaReq } from "@/domain/dto/configuracion/request/UpdateTarifaMultaReq";
import { type GetAllTarifasMultaRes } from "@/domain/dto/configuracion/response/GetAllTarifasMultaRes";
import { type UpdateTarifaMultaRes } from "@/domain/dto/configuracion/response/UpdateTarifaMultaRes";
import { ErrorHandler, ErrorMessages } from "@/domain/messages";

export class ConfiguracionApiDataSource implements ConfiguracionDataSourceI {
    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async getAllTarifasMulta(dto: GetAllTarifasMultaReq): Promise<GetAllTarifasMultaRes> {
        try {
            const response = await this.httpClient.get(
                "/configuracion/multas",
                {},
                dto.session.accessToken,
                withCacheTags(CacheTags.CONFIGURACION_MULTAS)
            );

            return { tarifas: TarifaMulta.fromList(response?.tarifas ?? response) };
        } catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async updateTarifaMulta(dto: UpdateTarifaMultaReq): Promise<UpdateTarifaMultaRes> {
        try {
            const motivo = dto.motivo instanceof MotivoMulta ? dto.motivo.value : dto.motivo;
            const response = await this.httpClient.put(
                `/configuracion/multas/${encodeURIComponent(motivo)}`,
                { monto: dto.monto },
                dto.session.accessToken
            );

            const tarifa = TarifaMulta.fromObject(response?.tarifa ?? response);
            if (!tarifa) {
                throw new Error(ErrorMessages.UNEXPECTED_ERROR);
            }

            return { tarifa };
        } catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }
}
