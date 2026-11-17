import { type GetAllAutoresReq } from "../dto/autor/request/GetAllAutoresReq";
import { type GetAllAutoresRes } from "../dto/autor/response/GetAllAutoresRes";
import { type CreateAutorReq } from "../dto/autor/request/CreateAutorReq";
import { type CreateAutorRes } from "../dto/autor/response/CreateAutorRes";
import { type UpdateAutorReq } from "../dto/autor/request/UpdateAutorReq";
import { type UpdateAutorRes } from "../dto/autor/response/UpdateAutorRes";

export abstract class AutorDataSourceI {
    abstract getAllAutores(dto: GetAllAutoresReq): Promise<GetAllAutoresRes>;
    abstract createAutor(dto: CreateAutorReq): Promise<CreateAutorRes>;
    abstract updateAutor(dto: UpdateAutorReq): Promise<UpdateAutorRes>;
}
