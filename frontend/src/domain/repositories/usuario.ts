import { type GetAllUsuariosReq } from "../dto/usuario/request/GetAllUsuariosReq";
import { type GetAllUsuariosRes } from "../dto/usuario/response/GetAllUsuariosRes";
import { type GetUsuarioByIdReq } from "../dto/usuario/request/GetUsuarioByIdReq";
import { type GetUsuarioByIdRes } from "../dto/usuario/response/GetUsuarioByIdRes";
import { type CreateUsuarioReq } from "../dto/usuario/request/CreateUsuarioReq";
import { type CreateUsuarioRes } from "../dto/usuario/response/CreateUsuarioRes";
import { type UpdateUsuarioReq } from "../dto/usuario/request/UpdateUsuarioReq";
import { type UpdateUsuarioRes } from "../dto/usuario/response/UpdateUsuarioRes";

export abstract class UsuarioRepositoryI {
    abstract getAllUsuarios(dto: GetAllUsuariosReq): Promise<GetAllUsuariosRes>;
    abstract getUsuarioById(dto: GetUsuarioByIdReq): Promise<GetUsuarioByIdRes>;
    abstract createUsuario(dto: CreateUsuarioReq): Promise<CreateUsuarioRes>;
    abstract updateUsuario(dto: UpdateUsuarioReq): Promise<UpdateUsuarioRes>;
}
