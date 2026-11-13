import { MultaRepositoryI } from "../../repositories/multa";
import { type Session } from "../../entities/session";
import { Multa } from "../../entities/multa";

export interface PagarMultaCommand {
    session: Session;
    id: string;
    fechaPago?: string | null;
}

export interface PagarMultaResult {
    id: string;
    multa?: Multa | null;
}

export class PagarMultaUseCase {

    private readonly multaRepository: MultaRepositoryI;

    constructor(multaRepository: MultaRepositoryI) {
        this.multaRepository = multaRepository;
    }

    public async execute(command: PagarMultaCommand): Promise<PagarMultaResult> {
        const response = await this.multaRepository.pagarMulta({
            session: command.session,
            id: command.id,
            fechaPago: command.fechaPago
        });

        return {
            id: response.id,
            multa: response.multa
        };
    }

}
