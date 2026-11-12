import { UsuarioDataSourceI } from "../../../domain/datasources/usuario";
import { Usuario, Rol } from "../../../domain/entities/usuario";
import { UsuarioFilters } from "../../../domain/filters/usuario-filters";
import { type GetAllUsuariosReq } from "../../../domain/dto/usuario/request/GetAllUsuariosReq";
import { type GetAllUsuariosRes } from "../../../domain/dto/usuario/response/GetAllUsuariosRes";
import { type GetUsuarioByIdReq } from "../../../domain/dto/usuario/request/GetUsuarioByIdReq";
import { type GetUsuarioByIdRes } from "../../../domain/dto/usuario/response/GetUsuarioByIdRes";
import { type CreateUsuarioReq } from "../../../domain/dto/usuario/request/CreateUsuarioReq";
import { type CreateUsuarioRes } from "../../../domain/dto/usuario/response/CreateUsuarioRes";
import { type UpdateUsuarioReq } from "../../../domain/dto/usuario/request/UpdateUsuarioReq";
import { type UpdateUsuarioRes } from "../../../domain/dto/usuario/response/UpdateUsuarioRes";
import { HTTPClient } from "../../../core/adapters/http-client";
import { CacheTags, withCacheTags } from "../../../core/config/cache";
import { ErrorHandler } from "@/domain/messages";

export class UsuarioApiDataSource implements UsuarioDataSourceI {

    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async getAllUsuarios(dto: GetAllUsuariosReq): Promise<GetAllUsuariosRes> {
        try {
            const filters = dto.filters ?? UsuarioFilters.fromObject(dto);
            const params = filters.toApiParams();

            const response = await this.httpClient.get(
                "/usuarios",
                params,
                dto.session?.accessToken,
                withCacheTags(CacheTags.USUARIOS)
            );

            const list = Array.isArray(response)
                ? response
                : (response?.usuarios || response?.items || response?.data || []);

            return {
                usuarios: Usuario.fromList(list),
                total: response?.total ?? response?.totalElements ?? list.length ?? 0
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getUsuarioById(dto: GetUsuarioByIdReq): Promise<GetUsuarioByIdRes> {
        try {
            const response = await this.httpClient.get(
                `/usuarios/${dto.id}`,
                {},
                dto.session?.accessToken,
                withCacheTags(CacheTags.USUARIOS, CacheTags.usuarioDetail(dto.id))
            );

            return {
                usuario: Usuario.fromObject(response?.usuario || response)!
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async createUsuario(dto: CreateUsuarioReq): Promise<CreateUsuarioRes> {
        try {
            const roleValue = dto.role instanceof Rol ? dto.role.value : dto.role;

            const response = await this.httpClient.post(
                "/usuarios",
                {
                    nombre: dto.nombre,
                    apellido: dto.apellido,
                    email: dto.email,
                    password: dto.password,
                    role: roleValue,
                    activo: dto.activo ?? true
                },
                dto.session?.accessToken
            );

            const usuario = Usuario.fromObject(response?.usuario || response);

            return {
                id: String(response?.id || response?.usuario?.id || usuario?.id || ""),
                usuario
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async updateUsuario(dto: UpdateUsuarioReq): Promise<UpdateUsuarioRes> {
        try {
            const payload: Record<string, any> = {};

            if (dto.nombre !== undefined) payload.nombre = dto.nombre;
            if (dto.apellido !== undefined) payload.apellido = dto.apellido;
            if (dto.email !== undefined) payload.email = dto.email;
            if (dto.password !== undefined && dto.password !== "") payload.password = dto.password;
            if (dto.activo !== undefined) payload.activo = dto.activo;
            if (dto.role !== undefined) {
                payload.role = dto.role instanceof Rol ? dto.role.value : dto.role;
            }

            const response = await this.httpClient.put(
                `/usuarios/${dto.id}`,
                payload,
                dto.session?.accessToken
            );

            const usuario = Usuario.fromObject(response?.usuario || response);

            return {
                id: String(response?.id || response?.usuario?.id || dto.id),
                usuario
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

}
