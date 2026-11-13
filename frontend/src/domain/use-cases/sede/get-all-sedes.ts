import { SedeRepositoryI } from "../../repositories/sede";
import { type EstadoSede } from "../../entities/estado-sede";
import { type Sede } from "../../entities/sede";
import { type Session } from "../../entities/session";

export interface GetAllSedesCommand {
    estado?: EstadoSede;
    session: Session;
}

export interface GetAllSedesResult {
    sedes: Sede[];
}

export class GetAllSedesUseCase {

    private readonly sedeRepository: SedeRepositoryI;

    constructor(sedeRepository: SedeRepositoryI) {
        this.sedeRepository = sedeRepository;
    }

    public async execute(command: GetAllSedesCommand): Promise<GetAllSedesResult> {
        const response = await this.sedeRepository.getAllSedes({
            estado: command.estado,
            session: command.session
        });
        return {
            sedes: response.sedes
        };
    }

}
