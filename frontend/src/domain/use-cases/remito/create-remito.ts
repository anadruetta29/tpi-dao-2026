import { RemitoRepositoryI } from "../../repositories/remito";
import { type Session } from "../../entities/session";
import { Remito } from "../../entities/remito";

export interface CreateRemitoCommand {
    session: Session;
    ejemplaresIds: string[];
    sede_origen_id?: string | null;
    sede_destino_id?: string | null;
    fechaEmision?: string | null;
}

export interface CreateRemitoResult {
    id: string;
    remito?: Remito | null;
}

export class CreateRemitoUseCase {

    private readonly remitoRepository: RemitoRepositoryI;

    constructor(remitoRepository: RemitoRepositoryI) {
        this.remitoRepository = remitoRepository;
    }

    public async execute(command: CreateRemitoCommand): Promise<CreateRemitoResult> {
        const response = await this.remitoRepository.createRemito({
            session: command.session,
            ejemplaresIds: command.ejemplaresIds,
            sede_origen_id: command.sede_origen_id,
            sede_destino_id: command.sede_destino_id,
            fechaEmision: command.fechaEmision
        });

        return {
            id: response.id,
            remito: response.remito
        };
    }

}
