import { ConfiguracionRepositoryI } from "../../repositories/configuracion";
import { MotivoMulta } from "../../entities/motivo-multa";
import { Session } from "../../entities/session";
import { TarifaMulta } from "../../entities/tarifa-multa";

export interface UpdateTarifaMultaCommand {
    session: Session;
    motivo: MotivoMulta | string;
    monto: number;
}

export interface UpdateTarifaMultaResult {
    tarifa: TarifaMulta;
}

export class UpdateTarifaMultaUseCase {
    private readonly configuracionRepository: ConfiguracionRepositoryI;

    constructor(configuracionRepository: ConfiguracionRepositoryI) {
        this.configuracionRepository = configuracionRepository;
    }

    public async execute(command: UpdateTarifaMultaCommand): Promise<UpdateTarifaMultaResult> {
        return await this.configuracionRepository.updateTarifaMulta({
            session: command.session,
            motivo: command.motivo,
            monto: command.monto
        });
    }
}
