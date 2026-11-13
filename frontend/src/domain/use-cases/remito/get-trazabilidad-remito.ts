import { RemitoRepositoryI } from "../../repositories/remito";
import { type Session } from "../../entities/session";
import { HistorialEstadoRemito } from "../../entities/historial-estado-remito";

export interface GetTrazabilidadRemitoCommand {
    session: Session;
    id: string;
}

export interface GetTrazabilidadRemitoResult {
    remitoId: string;
    historial: HistorialEstadoRemito[];
}

export class GetTrazabilidadRemitoUseCase {

    private readonly remitoRepository: RemitoRepositoryI;

    constructor(remitoRepository: RemitoRepositoryI) {
        this.remitoRepository = remitoRepository;
    }

    public async execute(command: GetTrazabilidadRemitoCommand): Promise<GetTrazabilidadRemitoResult> {
        const response = await this.remitoRepository.getTrazabilidad({
            session: command.session,
            id: command.id
        });

        return {
            remitoId: response.remitoId,
            historial: response.historial
        };
    }

}
