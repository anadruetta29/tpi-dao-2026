import { HTTPClient } from "@/core/adapters/http-client";
import { CacheTags, withCacheTags } from "@/core/config/cache";
import { type SolicitudPrestamoDataSourceI } from "@/domain/datasources/solicitud-prestamo";
import { SolicitudPrestamo } from "@/domain/entities/solicitud-prestamo";
import { SolicitudPrestamoFilters } from "@/domain/filters/solicitud-prestamo-filters";
import { type GetAllSolicitudesPrestamoReq } from "@/domain/dto/solicitud-prestamo/request/GetAllSolicitudesPrestamoReq";
import { type GetAllSolicitudesPrestamoRes } from "@/domain/dto/solicitud-prestamo/response/GetAllSolicitudesPrestamoRes";
import { type GetSolicitudPrestamoByIdReq } from "@/domain/dto/solicitud-prestamo/request/GetSolicitudPrestamoByIdReq";
import { type GetSolicitudPrestamoByIdRes } from "@/domain/dto/solicitud-prestamo/response/GetSolicitudPrestamoByIdRes";
import { type CreateSolicitudLocalReq } from "@/domain/dto/solicitud-prestamo/request/CreateSolicitudLocalReq";
import { type CreateSolicitudLocalRes } from "@/domain/dto/solicitud-prestamo/response/CreateSolicitudLocalRes";
import { type CreateSolicitudInterbibliotecariaReq } from "@/domain/dto/solicitud-prestamo/request/CreateSolicitudInterbibliotecariaReq";
import { type CreateSolicitudInterbibliotecariaRes } from "@/domain/dto/solicitud-prestamo/response/CreateSolicitudInterbibliotecariaRes";
import { type UpdateSolicitudEstadoReq } from "@/domain/dto/solicitud-prestamo/request/UpdateSolicitudEstadoReq";
import { type UpdateSolicitudEstadoRes } from "@/domain/dto/solicitud-prestamo/response/UpdateSolicitudEstadoRes";
import { ErrorHandler, ErrorMessages } from "@/domain/messages";

export class SolicitudPrestamoApiDataSource implements SolicitudPrestamoDataSourceI {

    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async getAllSolicitudesPrestamo(dto: GetAllSolicitudesPrestamoReq): Promise<GetAllSolicitudesPrestamoRes> {
        try {
            const response = await this.httpClient.get(
                "/solicitudes-prestamo",
                new SolicitudPrestamoFilters(dto.tipo, dto.estado, dto.sedeId).toApiParams(),
                dto.session.accessToken,
                withCacheTags(CacheTags.SOLICITUDES_PRESTAMO)
            );

            return { solicitudes: SolicitudPrestamo.fromList(response?.solicitudes ?? response) };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getSolicitudPrestamoById(dto: GetSolicitudPrestamoByIdReq): Promise<GetSolicitudPrestamoByIdRes> {
        try {
            const response = await this.httpClient.get(
                `/solicitudes-prestamo/${encodeURIComponent(dto.id)}`,
                {},
                dto.session.accessToken,
                withCacheTags(CacheTags.SOLICITUDES_PRESTAMO)
            );

            const solicitud = SolicitudPrestamo.fromObject(response?.solicitud ?? response);
            if (!solicitud?.id) {
                throw new Error(ErrorMessages.GET_SOLICITUD_PRESTAMO_BY_ID_ERROR);
            }

            return { solicitud };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async createSolicitudLocal(dto: CreateSolicitudLocalReq): Promise<CreateSolicitudLocalRes> {
        try {
            const response = await this.httpClient.post(
                "/solicitudes-prestamo/local",
                {
                    socio_id: Number(dto.socioId),
                    ejemplar_id: Number(dto.ejemplarId),
                    sede_origen_id: Number(dto.sedeOrigenId)
                },
                dto.session.accessToken
            );

            const solicitud = SolicitudPrestamo.fromObject(response?.solicitud ?? response);
            if (!solicitud?.id) {
                throw new Error(ErrorMessages.CREATE_SOLICITUD_LOCAL_ERROR);
            }

            return { solicitud };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async createSolicitudInterbibliotecaria(dto: CreateSolicitudInterbibliotecariaReq): Promise<CreateSolicitudInterbibliotecariaRes> {
        try {
            const response = await this.httpClient.post(
                "/solicitudes-prestamo/interbibliotecario",
                {
                    socio_id: Number(dto.socioId),
                    ejemplar_id: Number(dto.ejemplarId),
                    sede_origen_id: Number(dto.sedeOrigenId),
                    sede_destino_id: Number(dto.sedeDestinoId)
                },
                dto.session.accessToken
            );

            const solicitud = SolicitudPrestamo.fromObject(response?.solicitud ?? response);
            if (!solicitud?.id) {
                throw new Error(ErrorMessages.CREATE_SOLICITUD_INTERBIBLIOTECARIA_ERROR);
            }

            return { solicitud };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async updateSolicitudEstado(dto: UpdateSolicitudEstadoReq): Promise<UpdateSolicitudEstadoRes> {
        try {
            const response = await this.httpClient.patch(
                `/solicitudes-prestamo/${encodeURIComponent(dto.id)}/estado`,
                {
                    estado: dto.estado.getValue()
                },
                dto.session.accessToken
            );

            const solicitud = SolicitudPrestamo.fromObject(response?.solicitud ?? response);
            if (!solicitud?.id) {
                throw new Error(ErrorMessages.UPDATE_SOLICITUD_ESTADO_ERROR);
            }

            return { solicitud };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

}
