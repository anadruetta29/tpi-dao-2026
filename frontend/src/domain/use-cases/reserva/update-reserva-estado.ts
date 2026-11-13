import { type Session } from "@/domain/entities/session";
import { type EstadoReserva } from "@/domain/entities/estado-reserva";
import { type ReservaRepositoryI } from "@/domain/repositories/reserva";
import { type Reserva } from "@/domain/entities/reserva";

export interface UpdateReservaEstadoCommand {
    id: string;
    estado: EstadoReserva;
    session: Session;
}

export interface UpdateReservaEstadoResult {
    reserva: Reserva;
}

export class UpdateReservaEstadoUseCase {

    private readonly reservaRepository: ReservaRepositoryI;

    constructor(reservaRepository: ReservaRepositoryI) {
        this.reservaRepository = reservaRepository;
    }

    public async execute(command: UpdateReservaEstadoCommand): Promise<UpdateReservaEstadoResult> {
        const response = await this.reservaRepository.updateReservaEstado({
            id: command.id,
            estado: command.estado,
            session: command.session
        });

        return { reserva: response.reserva };
    }

}
