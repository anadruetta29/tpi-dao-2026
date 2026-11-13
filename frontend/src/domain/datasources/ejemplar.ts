import { type GetAllEjemplaresReq } from "../dto/ejemplar/request/GetAllEjemplaresReq";
import { type GetAllEjemplaresRes } from "../dto/ejemplar/response/GetAllEjemplaresRes";
import { type GetEjemplarByIdReq } from "../dto/ejemplar/request/GetEjemplarByIdReq";
import { type GetEjemplarByIdRes } from "../dto/ejemplar/response/GetEjemplarByIdRes";
import { type CreateEjemplarReq } from "../dto/ejemplar/request/CreateEjemplarReq";
import { type CreateEjemplarRes } from "../dto/ejemplar/response/CreateEjemplarRes";

export abstract class EjemplarDataSourceI {
    abstract getAllEjemplares(dto: GetAllEjemplaresReq): Promise<GetAllEjemplaresRes>;
    abstract getEjemplarById(dto: GetEjemplarByIdReq): Promise<GetEjemplarByIdRes>;
    abstract createEjemplar(dto: CreateEjemplarReq): Promise<CreateEjemplarRes>;
}
