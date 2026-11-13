import { type Session } from "@/domain/entities/session";
import { type EstadoReserva } from "@/domain/entities/estado-reserva";
import { type ReservaRepositoryI } from "@/domain/repositories/reserva";
import { type Reserva } from "@/domain/entities/reserva";

export interface GetAllReservasCommand {
    libroId?: string;
    socioId?: string;
    sedeId?: string;
    estado?: EstadoReserva;
    session: Session;
}

export interface GetAllReservasResult {
    reservas: Reserva[];
}

export class GetAllReservasUseCase {

    private readonly reservaRepository: ReservaRepositoryI;

    constructor(reservaRepository: ReservaRepositoryI) {
        this.reservaRepository = reservaRepository;
    }

    public async execute(command: GetAllReservasCommand): Promise<GetAllReservasResult> {
        const response = await this.reservaRepository.getAllReservas({
            libroId: command.libroId,
            socioId: command.socioId,
            sedeId: command.sedeId,
            estado: command.estado,
            session: command.session
        });

        return { reservas: response.reservas };
    }

}
