import { type Session } from "@/domain/entities/session";
import { type ReservaRepositoryI } from "@/domain/repositories/reserva";
import { type Reserva } from "@/domain/entities/reserva";

export interface CreateReservaCommand {
    socioId: string;
    libroId?: string;
    ejemplarId?: string;
    sedeId?: string;
    fecha?: string;
    session: Session;
}

export interface CreateReservaResult {
    reserva: Reserva;
}

export class CreateReservaUseCase {

    private readonly reservaRepository: ReservaRepositoryI;

    constructor(reservaRepository: ReservaRepositoryI) {
        this.reservaRepository = reservaRepository;
    }

    public async execute(command: CreateReservaCommand): Promise<CreateReservaResult> {
        const response = await this.reservaRepository.createReserva({
            socioId: command.socioId,
            libroId: command.libroId,
            ejemplarId: command.ejemplarId,
            sedeId: command.sedeId,
            fecha: command.fecha,
            session: command.session
        });

        return { reserva: response.reserva };
    }

}
