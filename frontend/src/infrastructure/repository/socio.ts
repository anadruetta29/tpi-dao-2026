import { type SocioDataSourceI } from "@/domain/datasources/socio";
import { type SocioRepositoryI } from "@/domain/repositories/socio";
import { type GetAllSociosReq } from "@/domain/dto/socio/request/GetAllSociosReq";
import { type GetAllSociosRes } from "@/domain/dto/socio/response/GetAllSociosRes";
import { type GetSocioByIdReq } from "@/domain/dto/socio/request/GetSocioByIdReq";
import { type GetSocioByIdRes } from "@/domain/dto/socio/response/GetSocioByIdRes";
import { type GetSocioPrestamosReq } from "@/domain/dto/socio/request/GetSocioPrestamosReq";
import { type GetSocioPrestamosRes } from "@/domain/dto/socio/response/GetSocioPrestamosRes";
import { type GetSocioMultasReq } from "@/domain/dto/socio/request/GetSocioMultasReq";
import { type GetSocioMultasRes } from "@/domain/dto/socio/response/GetSocioMultasRes";
import { type CreateSocioReq } from "@/domain/dto/socio/request/CreateSocioReq";
import { type CreateSocioRes } from "@/domain/dto/socio/response/CreateSocioRes";
import { type UpdateSocioReq } from "@/domain/dto/socio/request/UpdateSocioReq";
import { type UpdateSocioRes } from "@/domain/dto/socio/response/UpdateSocioRes";
import { type DeleteSocioReq } from "@/domain/dto/socio/request/DeleteSocioReq";

export class SocioRepository implements SocioRepositoryI {

    private readonly dataSource: SocioDataSourceI;

    constructor(dataSource: SocioDataSourceI) {
        this.dataSource = dataSource;
    }

    public async getAllSocios(dto: GetAllSociosReq): Promise<GetAllSociosRes> {
        return await this.dataSource.getAllSocios(dto);
    }

    public async getSocioById(dto: GetSocioByIdReq): Promise<GetSocioByIdRes> {
        return await this.dataSource.getSocioById(dto);
    }

    public async getSocioPrestamos(dto: GetSocioPrestamosReq): Promise<GetSocioPrestamosRes> {
        return await this.dataSource.getSocioPrestamos(dto);
    }

    public async getSocioMultas(dto: GetSocioMultasReq): Promise<GetSocioMultasRes> {
        return await this.dataSource.getSocioMultas(dto);
    }

    public async createSocio(dto: CreateSocioReq): Promise<CreateSocioRes> {
        return await this.dataSource.createSocio(dto);
    }

    public async updateSocio(dto: UpdateSocioReq): Promise<UpdateSocioRes> {
        return await this.dataSource.updateSocio(dto);
    }

    public async deleteSocio(dto: DeleteSocioReq): Promise<void> {
        return await this.dataSource.deleteSocio(dto);
    }

}
