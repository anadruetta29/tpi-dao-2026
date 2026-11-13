import { type Session } from "@/domain/entities/session";
import { type DevolucionRepositoryI } from "@/domain/repositories/devolucion";
import { type Devolucion } from "@/domain/entities/devolucion";

export interface GetDevolucionByIdCommand {
    id: string;
    session: Session;
}

export interface GetDevolucionByIdResult {
    devolucion: Devolucion;
}

export class GetDevolucionByIdUseCase {

    private readonly devolucionRepository: DevolucionRepositoryI;

    constructor(devolucionRepository: DevolucionRepositoryI) {
        this.devolucionRepository = devolucionRepository;
    }

    public async execute(command: GetDevolucionByIdCommand): Promise<GetDevolucionByIdResult> {
        const response = await this.devolucionRepository.getDevolucionById({
            id: command.id,
            session: command.session
        });

        return { devolucion: response.devolucion };
    }

}
