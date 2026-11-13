import { type Session } from "@/domain/entities/session";
import { type ReservaRepositoryI } from "@/domain/repositories/reserva";
import { type Reserva } from "@/domain/entities/reserva";

export interface GetReservaByIdCommand {
    id: string;
    session: Session;
}

export interface GetReservaByIdResult {
    reserva: Reserva;
}

export class GetReservaByIdUseCase {

    private readonly reservaRepository: ReservaRepositoryI;

    constructor(reservaRepository: ReservaRepositoryI) {
        this.reservaRepository = reservaRepository;
    }

    public async execute(command: GetReservaByIdCommand): Promise<GetReservaByIdResult> {
        const response = await this.reservaRepository.getReservaById({
            id: command.id,
            session: command.session
        });

        return { reserva: response.reserva };
    }

}
