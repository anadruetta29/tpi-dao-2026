import { MultaRepositoryI } from "../../repositories/multa";
import { type Session } from "../../entities/session";
import { Multa } from "../../entities/multa";
import { MotivoMulta } from "../../entities/motivo-multa";
import { EstadoMulta } from "../../entities/estado-multa";

export interface CreateMultaCommand {
    session: Session;
    socio_id: string;
    prestamo_id: string;
    motivo: MotivoMulta | string;
    monto: number;
}

export interface CreateMultaResult {
    id: string;
    multa?: Multa | null;
}

export class CreateMultaUseCase {

    private readonly multaRepository: MultaRepositoryI;

    constructor(multaRepository: MultaRepositoryI) {
        this.multaRepository = multaRepository;
    }

    public async execute(command: CreateMultaCommand): Promise<CreateMultaResult> {
        const response = await this.multaRepository.createMulta({
            session: command.session,
            socio_id: command.socio_id,
            prestamo_id: command.prestamo_id,
            motivo: command.motivo,
            monto: command.monto,
            estado: EstadoMulta.PENDIENTE
        });

        return {
            id: response.id,
            multa: response.multa
        };
    }

}
