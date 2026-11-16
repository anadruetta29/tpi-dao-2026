import { ConfiguracionRepositoryI } from "../../repositories/configuracion";
import { Session } from "../../entities/session";
import { TarifaMulta } from "../../entities/tarifa-multa";

export interface GetAllTarifasMultaCommand {
    session: Session;
}

export interface GetAllTarifasMultaResult {
    tarifas: TarifaMulta[];
}

export class GetAllTarifasMultaUseCase {
    private readonly configuracionRepository: ConfiguracionRepositoryI;

    constructor(configuracionRepository: ConfiguracionRepositoryI) {
        this.configuracionRepository = configuracionRepository;
    }

    public async execute(command: GetAllTarifasMultaCommand): Promise<GetAllTarifasMultaResult> {
        return await this.configuracionRepository.getAllTarifasMulta({
            session: command.session
        });
    }
}
