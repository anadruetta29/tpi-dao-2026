import { type GetRecepcionistasReq } from "@/domain/dto/solicitud-prestamo/request/GetRecepcionistasReq";
import { type GetRecepcionistasRes } from "@/domain/dto/solicitud-prestamo/response/GetRecepcionistasRes";
import { type SolicitudPrestamoRepositoryI } from "@/domain/repositories/solicitud-prestamo";

export type GetRecepcionistasCommand = GetRecepcionistasReq;
export type GetRecepcionistasResult = GetRecepcionistasRes;

export class GetRecepcionistasUseCase {
    constructor(private readonly repository: SolicitudPrestamoRepositoryI) {}

    public execute(command: GetRecepcionistasCommand): Promise<GetRecepcionistasResult> {
        return this.repository.getRecepcionistas(command);
    }
}
