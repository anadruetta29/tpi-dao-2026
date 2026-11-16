import { ConfiguracionDataSourceI } from "@/domain/datasources/configuracion";
import { ConfiguracionRepositoryI } from "@/domain/repositories/configuracion";
import { type GetAllTarifasMultaReq } from "@/domain/dto/configuracion/request/GetAllTarifasMultaReq";
import { type UpdateTarifaMultaReq } from "@/domain/dto/configuracion/request/UpdateTarifaMultaReq";
import { type GetAllTarifasMultaRes } from "@/domain/dto/configuracion/response/GetAllTarifasMultaRes";
import { type UpdateTarifaMultaRes } from "@/domain/dto/configuracion/response/UpdateTarifaMultaRes";

export class ConfiguracionRepository implements ConfiguracionRepositoryI {
    private readonly dataSource: ConfiguracionDataSourceI;

    constructor(dataSource: ConfiguracionDataSourceI) {
        this.dataSource = dataSource;
    }

    public async getAllTarifasMulta(dto: GetAllTarifasMultaReq): Promise<GetAllTarifasMultaRes> {
        return await this.dataSource.getAllTarifasMulta(dto);
    }

    public async updateTarifaMulta(dto: UpdateTarifaMultaReq): Promise<UpdateTarifaMultaRes> {
        return await this.dataSource.updateTarifaMulta(dto);
    }
}
