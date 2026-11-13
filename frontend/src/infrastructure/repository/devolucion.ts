import { type DevolucionDataSourceI } from "@/domain/datasources/devolucion";
import { type DevolucionRepositoryI } from "@/domain/repositories/devolucion";
import { type GetAllDevolucionesReq } from "@/domain/dto/devolucion/request/GetAllDevolucionesReq";
import { type GetAllDevolucionesRes } from "@/domain/dto/devolucion/response/GetAllDevolucionesRes";
import { type GetDevolucionByIdReq } from "@/domain/dto/devolucion/request/GetDevolucionByIdReq";
import { type GetDevolucionByIdRes } from "@/domain/dto/devolucion/response/GetDevolucionByIdRes";
import { type CreateDevolucionReq } from "@/domain/dto/devolucion/request/CreateDevolucionReq";
import { type CreateDevolucionRes } from "@/domain/dto/devolucion/response/CreateDevolucionRes";

export class DevolucionRepository implements DevolucionRepositoryI {

    private readonly dataSource: DevolucionDataSourceI;

    constructor(dataSource: DevolucionDataSourceI) {
        this.dataSource = dataSource;
    }

    public async getAllDevoluciones(dto: GetAllDevolucionesReq): Promise<GetAllDevolucionesRes> {
        return await this.dataSource.getAllDevoluciones(dto);
    }

    public async getDevolucionById(dto: GetDevolucionByIdReq): Promise<GetDevolucionByIdRes> {
        return await this.dataSource.getDevolucionById(dto);
    }

    public async createDevolucion(dto: CreateDevolucionReq): Promise<CreateDevolucionRes> {
        return await this.dataSource.createDevolucion(dto);
    }

}
