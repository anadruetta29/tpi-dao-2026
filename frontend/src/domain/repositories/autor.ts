import { type GetAllAutoresReq } from "../dto/autor/request/GetAllAutoresReq";
import { type GetAllAutoresRes } from "../dto/autor/response/GetAllAutoresRes";
import { type CreateAutorReq } from "../dto/autor/request/CreateAutorReq";
import { type CreateAutorRes } from "../dto/autor/response/CreateAutorRes";

export abstract class AutorRepositoryI {
    abstract getAllAutores(dto: GetAllAutoresReq): Promise<GetAllAutoresRes>;
    abstract createAutor(dto: CreateAutorReq): Promise<CreateAutorRes>;
}
