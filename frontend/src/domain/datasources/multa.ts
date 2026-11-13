import { type GetAllMultasReq } from "../dto/multa/request/GetAllMultasReq";
import { type GetAllMultasRes } from "../dto/multa/response/GetAllMultasRes";
import { type GetMultaByIdReq } from "../dto/multa/request/GetMultaByIdReq";
import { type GetMultaByIdRes } from "../dto/multa/response/GetMultaByIdRes";
import { type CreateMultaReq } from "../dto/multa/request/CreateMultaReq";
import { type CreateMultaRes } from "../dto/multa/response/CreateMultaRes";
import { type PagarMultaReq } from "../dto/multa/request/PagarMultaReq";
import { type PagarMultaRes } from "../dto/multa/response/PagarMultaRes";
import { type AnularMultaReq } from "../dto/multa/request/AnularMultaReq";
import { type AnularMultaRes } from "../dto/multa/response/AnularMultaRes";

export abstract class MultaDataSourceI {
    abstract getAllMultas(dto: GetAllMultasReq): Promise<GetAllMultasRes>;
    abstract getMultaById(dto: GetMultaByIdReq): Promise<GetMultaByIdRes>;
    abstract createMulta(dto: CreateMultaReq): Promise<CreateMultaRes>;
    abstract pagarMulta(dto: PagarMultaReq): Promise<PagarMultaRes>;
    abstract anularMulta(dto: AnularMultaReq): Promise<AnularMultaRes>;
}
