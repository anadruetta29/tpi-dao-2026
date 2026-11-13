import { type Session } from "@/domain/entities/session";
import { type EstadoEjemplar } from "@/domain/entities/estado-ejemplar";
import { type DevolucionRepositoryI } from "@/domain/repositories/devolucion";
import { type Devolucion } from "@/domain/entities/devolucion";

export interface CreateDevolucionCommand {
    prestamoId: string;
    fecha: string;
    observaciones?: string;
    estadoDevuelto: EstadoEjemplar;
    session: Session;
}

export interface CreateDevolucionResult {
    devolucion: Devolucion;
}

export class CreateDevolucionUseCase {

    private readonly devolucionRepository: DevolucionRepositoryI;

    constructor(devolucionRepository: DevolucionRepositoryI) {
        this.devolucionRepository = devolucionRepository;
    }

    public async execute(command: CreateDevolucionCommand): Promise<CreateDevolucionResult> {
        const response = await this.devolucionRepository.createDevolucion({
            prestamoId: command.prestamoId,
            fecha: command.fecha,
            observaciones: command.observaciones,
            estadoDevuelto: command.estadoDevuelto,
            session: command.session
        });

        return { devolucion: response.devolucion };
    }

}
