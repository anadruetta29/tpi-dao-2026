import { RemitoRepositoryI } from "../../repositories/remito";
import { type Session } from "../../entities/session";
import { Remito } from "../../entities/remito";
import { EstadoEnvio } from "../../entities/estado-envio";
import { type RemitoFilters } from "../../filters/remito-filters";

export interface GetAllRemitosCommand {
    session: Session;
    sede_origen_id?: string | null;
    sede_destino_id?: string | null;
    estado?: string | EstadoEnvio | null;
    filters?: RemitoFilters;
}

export interface GetAllRemitosResult {
    remitos: Remito[];
    total: number;
}

export class GetAllRemitosUseCase {

    private readonly remitoRepository: RemitoRepositoryI;

    constructor(remitoRepository: RemitoRepositoryI) {
        this.remitoRepository = remitoRepository;
    }

    public async execute(command: GetAllRemitosCommand): Promise<GetAllRemitosResult> {
        const response = await this.remitoRepository.getAllRemitos({
            session: command.session,
            sede_origen_id: command.sede_origen_id,
            sede_destino_id: command.sede_destino_id,
            estado: command.estado,
            filters: command.filters
        });

        return {
            remitos: response.remitos,
            total: response.total
        };
    }

}
