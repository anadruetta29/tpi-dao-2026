import { UsuarioDataSourceI } from "@/domain/datasources/usuario";
import { UsuarioRepositoryI } from "@/domain/repositories/usuario";
import { type GetAllUsuariosReq } from "@/domain/dto/usuario/request/GetAllUsuariosReq";
import { type GetAllUsuariosRes } from "@/domain/dto/usuario/response/GetAllUsuariosRes";
import { type GetUsuarioByIdReq } from "@/domain/dto/usuario/request/GetUsuarioByIdReq";
import { type GetUsuarioByIdRes } from "@/domain/dto/usuario/response/GetUsuarioByIdRes";
import { type CreateUsuarioReq } from "@/domain/dto/usuario/request/CreateUsuarioReq";
import { type CreateUsuarioRes } from "@/domain/dto/usuario/response/CreateUsuarioRes";
import { type UpdateUsuarioReq } from "@/domain/dto/usuario/request/UpdateUsuarioReq";
import { type UpdateUsuarioRes } from "@/domain/dto/usuario/response/UpdateUsuarioRes";

export class UsuarioRepository implements UsuarioRepositoryI {

    private readonly dataSource: UsuarioDataSourceI;

    constructor(dataSource: UsuarioDataSourceI) {
        this.dataSource = dataSource;
    }

    public async getAllUsuarios(dto: GetAllUsuariosReq): Promise<GetAllUsuariosRes> {
        return await this.dataSource.getAllUsuarios(dto);
    }

    public async getUsuarioById(dto: GetUsuarioByIdReq): Promise<GetUsuarioByIdRes> {
        return await this.dataSource.getUsuarioById(dto);
    }

    public async createUsuario(dto: CreateUsuarioReq): Promise<CreateUsuarioRes> {
        return await this.dataSource.createUsuario(dto);
    }

    public async updateUsuario(dto: UpdateUsuarioReq): Promise<UpdateUsuarioRes> {
        return await this.dataSource.updateUsuario(dto);
    }

}
