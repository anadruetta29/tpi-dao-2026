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

export abstract class SocioDataSourceI {
    abstract getAllSocios(dto: GetAllSociosReq): Promise<GetAllSociosRes>;
    abstract getSocioById(dto: GetSocioByIdReq): Promise<GetSocioByIdRes>;
    abstract getSocioPrestamos(dto: GetSocioPrestamosReq): Promise<GetSocioPrestamosRes>;
    abstract getSocioMultas(dto: GetSocioMultasReq): Promise<GetSocioMultasRes>;
    abstract createSocio(dto: CreateSocioReq): Promise<CreateSocioRes>;
    abstract updateSocio(dto: UpdateSocioReq): Promise<UpdateSocioRes>;
    abstract deleteSocio(dto: DeleteSocioReq): Promise<void>;
}
