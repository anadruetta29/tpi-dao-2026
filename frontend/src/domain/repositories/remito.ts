import { type GetAllRemitosReq } from "../dto/remito/request/GetAllRemitosReq";
import { type GetAllRemitosRes } from "../dto/remito/response/GetAllRemitosRes";
import { type GetRemitoByIdReq } from "../dto/remito/request/GetRemitoByIdReq";
import { type GetRemitoByIdRes } from "../dto/remito/response/GetRemitoByIdRes";
import { type CreateRemitoReq } from "../dto/remito/request/CreateRemitoReq";
import { type CreateRemitoRes } from "../dto/remito/response/CreateRemitoRes";
import { type RegistrarDespachoRemitoReq } from "../dto/remito/request/RegistrarDespachoRemitoReq";
import { type RegistrarDespachoRemitoRes } from "../dto/remito/response/RegistrarDespachoRemitoRes";
import { type RegistrarRecepcionRemitoReq } from "../dto/remito/request/RegistrarRecepcionRemitoReq";
import { type RegistrarRecepcionRemitoRes } from "../dto/remito/response/RegistrarRecepcionRemitoRes";
import { type GetTrazabilidadRemitoReq } from "../dto/remito/request/GetTrazabilidadRemitoReq";
import { type GetTrazabilidadRemitoRes } from "../dto/remito/response/GetTrazabilidadRemitoRes";

export abstract class RemitoRepositoryI {
    abstract getAllRemitos(dto: GetAllRemitosReq): Promise<GetAllRemitosRes>;
    abstract getRemitoById(dto: GetRemitoByIdReq): Promise<GetRemitoByIdRes>;
    abstract createRemito(dto: CreateRemitoReq): Promise<CreateRemitoRes>;
    abstract registrarDespacho(dto: RegistrarDespachoRemitoReq): Promise<RegistrarDespachoRemitoRes>;
    abstract registrarRecepcion(dto: RegistrarRecepcionRemitoReq): Promise<RegistrarRecepcionRemitoRes>;
    abstract getTrazabilidad(dto: GetTrazabilidadRemitoReq): Promise<GetTrazabilidadRemitoRes>;
}
