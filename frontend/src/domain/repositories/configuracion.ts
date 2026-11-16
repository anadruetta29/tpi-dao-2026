import { type GetAllTarifasMultaReq } from "../dto/configuracion/request/GetAllTarifasMultaReq";
import { type UpdateTarifaMultaReq } from "../dto/configuracion/request/UpdateTarifaMultaReq";
import { type GetAllTarifasMultaRes } from "../dto/configuracion/response/GetAllTarifasMultaRes";
import { type UpdateTarifaMultaRes } from "../dto/configuracion/response/UpdateTarifaMultaRes";

export abstract class ConfiguracionRepositoryI {
    abstract getAllTarifasMulta(dto: GetAllTarifasMultaReq): Promise<GetAllTarifasMultaRes>;
    abstract updateTarifaMulta(dto: UpdateTarifaMultaReq): Promise<UpdateTarifaMultaRes>;
}
