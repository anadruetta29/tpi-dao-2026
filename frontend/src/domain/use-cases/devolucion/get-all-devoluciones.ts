import { type Session } from "@/domain/entities/session";
import { type DevolucionRepositoryI } from "@/domain/repositories/devolucion";
import { type Devolucion } from "@/domain/entities/devolucion";

export interface GetAllDevolucionesCommand {
    session: Session;
}

export interface GetAllDevolucionesResult {
    devoluciones: Devolucion[];
}

export class GetAllDevolucionesUseCase {

    private readonly devolucionRepository: DevolucionRepositoryI;

    constructor(devolucionRepository: DevolucionRepositoryI) {
        this.devolucionRepository = devolucionRepository;
    }

    public async execute(command: GetAllDevolucionesCommand): Promise<GetAllDevolucionesResult> {
        const response = await this.devolucionRepository.getAllDevoluciones({
            session: command.session
        });

        return { devoluciones: response.devoluciones };
    }

}
