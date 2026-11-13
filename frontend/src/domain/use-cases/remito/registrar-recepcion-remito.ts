import { RemitoRepositoryI } from "../../repositories/remito";
import { type Session } from "../../entities/session";
import { Remito } from "../../entities/remito";

export interface RegistrarRecepcionRemitoCommand {
    session: Session;
    id: string;
    fechaRecepcion?: string | null;
    conIncidencia?: boolean;
    observaciones?: string | null;
    ejemplaresRecibidosIds?: string[];
}

export interface RegistrarRecepcionRemitoResult {
    id: string;
    remito?: Remito | null;
}

export class RegistrarRecepcionRemitoUseCase {

    private readonly remitoRepository: RemitoRepositoryI;

    constructor(remitoRepository: RemitoRepositoryI) {
        this.remitoRepository = remitoRepository;
    }

    public async execute(command: RegistrarRecepcionRemitoCommand): Promise<RegistrarRecepcionRemitoResult> {
        const response = await this.remitoRepository.registrarRecepcion({
            session: command.session,
            id: command.id,
            fechaRecepcion: command.fechaRecepcion,
            conIncidencia: command.conIncidencia,
            observaciones: command.observaciones,
            ejemplaresRecibidosIds: command.ejemplaresRecibidosIds
        });

        return {
            id: response.id,
            remito: response.remito
        };
    }

}
