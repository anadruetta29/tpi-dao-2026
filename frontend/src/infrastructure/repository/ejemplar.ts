import { EjemplarDataSourceI } from "@/domain/datasources/ejemplar";
import { EjemplarRepositoryI } from "@/domain/repositories/ejemplar";
import { type GetAllEjemplaresReq } from "@/domain/dto/ejemplar/request/GetAllEjemplaresReq";
import { type GetAllEjemplaresRes } from "@/domain/dto/ejemplar/response/GetAllEjemplaresRes";
import { type GetEjemplarByIdReq } from "@/domain/dto/ejemplar/request/GetEjemplarByIdReq";
import { type GetEjemplarByIdRes } from "@/domain/dto/ejemplar/response/GetEjemplarByIdRes";
import { type CreateEjemplarReq } from "@/domain/dto/ejemplar/request/CreateEjemplarReq";
import { type CreateEjemplarRes } from "@/domain/dto/ejemplar/response/CreateEjemplarRes";

export class EjemplarRepository implements EjemplarRepositoryI {

    private readonly dataSource: EjemplarDataSourceI;

    constructor(dataSource: EjemplarDataSourceI) {
        this.dataSource = dataSource;
    }

    public async getAllEjemplares(dto: GetAllEjemplaresReq): Promise<GetAllEjemplaresRes> {
        return await this.dataSource.getAllEjemplares(dto);
    }

    public async getEjemplarById(dto: GetEjemplarByIdReq): Promise<GetEjemplarByIdRes> {
        return await this.dataSource.getEjemplarById(dto);
    }

    public async createEjemplar(dto: CreateEjemplarReq): Promise<CreateEjemplarRes> {
        return await this.dataSource.createEjemplar(dto);
    }

}
