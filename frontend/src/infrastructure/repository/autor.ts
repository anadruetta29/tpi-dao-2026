import { AutorDataSourceI } from "@/domain/datasources/autor";
import { AutorRepositoryI } from "@/domain/repositories/autor";
import { type GetAllAutoresReq } from "@/domain/dto/autor/request/GetAllAutoresReq";
import { type GetAllAutoresRes } from "@/domain/dto/autor/response/GetAllAutoresRes";
import { type CreateAutorReq } from "@/domain/dto/autor/request/CreateAutorReq";
import { type CreateAutorRes } from "@/domain/dto/autor/response/CreateAutorRes";

export class AutorRepository implements AutorRepositoryI {

    private readonly dataSource: AutorDataSourceI;

    constructor(dataSource: AutorDataSourceI) {
        this.dataSource = dataSource;
    }

    public async getAllAutores(dto: GetAllAutoresReq): Promise<GetAllAutoresRes> {
        return await this.dataSource.getAllAutores(dto);
    }

    public async createAutor(dto: CreateAutorReq): Promise<CreateAutorRes> {
        return await this.dataSource.createAutor(dto);
    }

}
