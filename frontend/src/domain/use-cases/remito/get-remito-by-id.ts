import { RemitoRepositoryI } from "../../repositories/remito";
import { type Session } from "../../entities/session";
import { Remito } from "../../entities/remito";
import { Ejemplar } from "../../entities/ejemplar";

export interface GetRemitoByIdCommand {
    session: Session;
    id: string;
}

export interface GetRemitoByIdResult {
    remito: Remito;
    ejemplares: Ejemplar[];
}

export class GetRemitoByIdUseCase {

    private readonly remitoRepository: RemitoRepositoryI;

    constructor(remitoRepository: RemitoRepositoryI) {
        this.remitoRepository = remitoRepository;
    }

    public async execute(command: GetRemitoByIdCommand): Promise<GetRemitoByIdResult> {
        const response = await this.remitoRepository.getRemitoById({
            session: command.session,
            id: command.id
        });

        return {
            remito: response.remito,
            ejemplares: response.ejemplares
        };
    }

}
