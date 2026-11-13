import { RemitoRepositoryI } from "../../repositories/remito";
import { type Session } from "../../entities/session";
import { Remito } from "../../entities/remito";

export interface RegistrarDespachoRemitoCommand {
    session: Session;
    id: string;
    fechaDespacho?: string | null;
}

export interface RegistrarDespachoRemitoResult {
    id: string;
    remito?: Remito | null;
}

export class RegistrarDespachoRemitoUseCase {

    private readonly remitoRepository: RemitoRepositoryI;

    constructor(remitoRepository: RemitoRepositoryI) {
        this.remitoRepository = remitoRepository;
    }

    public async execute(command: RegistrarDespachoRemitoCommand): Promise<RegistrarDespachoRemitoResult> {
        const response = await this.remitoRepository.registrarDespacho({
            session: command.session,
            id: command.id,
            fechaDespacho: command.fechaDespacho
        });

        return {
            id: response.id,
            remito: response.remito
        };
    }

}
