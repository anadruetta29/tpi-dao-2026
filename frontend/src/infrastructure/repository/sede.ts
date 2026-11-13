import { SedeDataSourceI } from "@/domain/datasources/sede";
import { SedeRepositoryI } from "@/domain/repositories/sede";
import { type GetAllSedesReq } from "@/domain/dto/sede/request/GetAllSedesReq";
import { type GetAllSedesRes } from "@/domain/dto/sede/response/GetAllSedesRes";
import { type GetSedeByIdReq } from "@/domain/dto/sede/request/GetSedeByIdReq";
import { type GetSedeByIdRes } from "@/domain/dto/sede/response/GetSedeByIdRes";
import { type CreateSedeReq } from "@/domain/dto/sede/request/CreateSedeReq";
import { type UpdateSedeReq } from "@/domain/dto/sede/request/UpdateSedeReq";
import { type DeleteSedeReq } from "@/domain/dto/sede/request/DeleteSedeReq";

export class SedeRepository implements SedeRepositoryI {

    private readonly dataSource: SedeDataSourceI;

    constructor(dataSource: SedeDataSourceI) {
        this.dataSource = dataSource;
    }

    public async getAllSedes(dto: GetAllSedesReq): Promise<GetAllSedesRes> {
        return await this.dataSource.getAllSedes(dto);
    }

    public async getSedeById(dto: GetSedeByIdReq): Promise<GetSedeByIdRes> {
        return await this.dataSource.getSedeById(dto);
    }

    public async createSede(dto: CreateSedeReq): Promise<void> {
        return await this.dataSource.createSede(dto);
    }

    public async updateSede(dto: UpdateSedeReq): Promise<void> {
        return await this.dataSource.updateSede(dto);
    }

    public async deleteSede(dto: DeleteSedeReq): Promise<void> {
        return await this.dataSource.deleteSede(dto);
    }

}
