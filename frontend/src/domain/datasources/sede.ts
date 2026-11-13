import { type GetAllSedesReq } from "../dto/sede/request/GetAllSedesReq";
import { type GetAllSedesRes } from "../dto/sede/response/GetAllSedesRes";
import { type GetSedeByIdReq } from "../dto/sede/request/GetSedeByIdReq";
import { type GetSedeByIdRes } from "../dto/sede/response/GetSedeByIdRes";
import { type CreateSedeReq } from "../dto/sede/request/CreateSedeReq";
import { type UpdateSedeReq } from "../dto/sede/request/UpdateSedeReq";
import { type DeleteSedeReq } from "../dto/sede/request/DeleteSedeReq";

export abstract class SedeDataSourceI {
    abstract getAllSedes(dto: GetAllSedesReq): Promise<GetAllSedesRes>;
    abstract getSedeById(dto: GetSedeByIdReq): Promise<GetSedeByIdRes>;
    abstract createSede(dto: CreateSedeReq): Promise<void>;
    abstract updateSede(dto: UpdateSedeReq): Promise<void>;
    abstract deleteSede(dto: DeleteSedeReq): Promise<void>;
}
