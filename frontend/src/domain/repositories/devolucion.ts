import { type GetAllDevolucionesReq } from "@/domain/dto/devolucion/request/GetAllDevolucionesReq";
import { type GetAllDevolucionesRes } from "@/domain/dto/devolucion/response/GetAllDevolucionesRes";
import { type GetDevolucionByIdReq } from "@/domain/dto/devolucion/request/GetDevolucionByIdReq";
import { type GetDevolucionByIdRes } from "@/domain/dto/devolucion/response/GetDevolucionByIdRes";
import { type CreateDevolucionReq } from "@/domain/dto/devolucion/request/CreateDevolucionReq";
import { type CreateDevolucionRes } from "@/domain/dto/devolucion/response/CreateDevolucionRes";

export abstract class DevolucionRepositoryI {
    abstract getAllDevoluciones(dto: GetAllDevolucionesReq): Promise<GetAllDevolucionesRes>;
    abstract getDevolucionById(dto: GetDevolucionByIdReq): Promise<GetDevolucionByIdRes>;
    abstract createDevolucion(dto: CreateDevolucionReq): Promise<CreateDevolucionRes>;
}
