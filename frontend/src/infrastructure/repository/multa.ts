import { MultaDataSourceI } from "@/domain/datasources/multa";
import { MultaRepositoryI } from "@/domain/repositories/multa";
import { type GetAllMultasReq } from "@/domain/dto/multa/request/GetAllMultasReq";
import { type GetAllMultasRes } from "@/domain/dto/multa/response/GetAllMultasRes";
import { type GetMultaByIdReq } from "@/domain/dto/multa/request/GetMultaByIdReq";
import { type GetMultaByIdRes } from "@/domain/dto/multa/response/GetMultaByIdRes";
import { type CreateMultaReq } from "@/domain/dto/multa/request/CreateMultaReq";
import { type CreateMultaRes } from "@/domain/dto/multa/response/CreateMultaRes";
import { type PagarMultaReq } from "@/domain/dto/multa/request/PagarMultaReq";
import { type PagarMultaRes } from "@/domain/dto/multa/response/PagarMultaRes";
import { type AnularMultaReq } from "@/domain/dto/multa/request/AnularMultaReq";
import { type AnularMultaRes } from "@/domain/dto/multa/response/AnularMultaRes";

export class MultaRepository implements MultaRepositoryI {

    private readonly dataSource: MultaDataSourceI;

    constructor(dataSource: MultaDataSourceI) {
        this.dataSource = dataSource;
    }

    public async getAllMultas(dto: GetAllMultasReq): Promise<GetAllMultasRes> {
        return await this.dataSource.getAllMultas(dto);
    }

    public async getMultaById(dto: GetMultaByIdReq): Promise<GetMultaByIdRes> {
        return await this.dataSource.getMultaById(dto);
    }

    public async createMulta(dto: CreateMultaReq): Promise<CreateMultaRes> {
        return await this.dataSource.createMulta(dto);
    }

    public async pagarMulta(dto: PagarMultaReq): Promise<PagarMultaRes> {
        return await this.dataSource.pagarMulta(dto);
    }

    public async anularMulta(dto: AnularMultaReq): Promise<AnularMultaRes> {
        return await this.dataSource.anularMulta(dto);
    }

}
