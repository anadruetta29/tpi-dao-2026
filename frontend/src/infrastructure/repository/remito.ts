import { RemitoDataSourceI } from "@/domain/datasources/remito";
import { RemitoRepositoryI } from "@/domain/repositories/remito";
import { type GetAllRemitosReq } from "@/domain/dto/remito/request/GetAllRemitosReq";
import { type GetAllRemitosRes } from "@/domain/dto/remito/response/GetAllRemitosRes";
import { type GetRemitoByIdReq } from "@/domain/dto/remito/request/GetRemitoByIdReq";
import { type GetRemitoByIdRes } from "@/domain/dto/remito/response/GetRemitoByIdRes";
import { type CreateRemitoReq } from "@/domain/dto/remito/request/CreateRemitoReq";
import { type CreateRemitoRes } from "@/domain/dto/remito/response/CreateRemitoRes";
import { type RegistrarDespachoRemitoReq } from "@/domain/dto/remito/request/RegistrarDespachoRemitoReq";
import { type RegistrarDespachoRemitoRes } from "@/domain/dto/remito/response/RegistrarDespachoRemitoRes";
import { type RegistrarRecepcionRemitoReq } from "@/domain/dto/remito/request/RegistrarRecepcionRemitoReq";
import { type RegistrarRecepcionRemitoRes } from "@/domain/dto/remito/response/RegistrarRecepcionRemitoRes";
import { type GetTrazabilidadRemitoReq } from "@/domain/dto/remito/request/GetTrazabilidadRemitoReq";
import { type GetTrazabilidadRemitoRes } from "@/domain/dto/remito/response/GetTrazabilidadRemitoRes";

export class RemitoRepository implements RemitoRepositoryI {

    private readonly dataSource: RemitoDataSourceI;

    constructor(dataSource: RemitoDataSourceI) {
        this.dataSource = dataSource;
    }

    public async getAllRemitos(dto: GetAllRemitosReq): Promise<GetAllRemitosRes> {
        return await this.dataSource.getAllRemitos(dto);
    }

    public async getRemitoById(dto: GetRemitoByIdReq): Promise<GetRemitoByIdRes> {
        return await this.dataSource.getRemitoById(dto);
    }

    public async createRemito(dto: CreateRemitoReq): Promise<CreateRemitoRes> {
        return await this.dataSource.createRemito(dto);
    }

    public async registrarDespacho(dto: RegistrarDespachoRemitoReq): Promise<RegistrarDespachoRemitoRes> {
        return await this.dataSource.registrarDespacho(dto);
    }

    public async registrarRecepcion(dto: RegistrarRecepcionRemitoReq): Promise<RegistrarRecepcionRemitoRes> {
        return await this.dataSource.registrarRecepcion(dto);
    }

    public async getTrazabilidad(dto: GetTrazabilidadRemitoReq): Promise<GetTrazabilidadRemitoRes> {
        return await this.dataSource.getTrazabilidad(dto);
    }

}
