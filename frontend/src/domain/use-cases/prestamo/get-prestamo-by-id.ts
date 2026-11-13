import { PrestamoRepositoryI } from "../../repositories/prestamo";
import { type Session } from "../../entities/session";
import { Prestamo } from "../../entities/prestamo";

export interface GetPrestamoByIdCommand {
    session: Session;
    id: string;
}

export interface GetPrestamoByIdResult {
    prestamo: Prestamo;
}

export class GetPrestamoByIdUseCase {

    private readonly prestamoRepository: PrestamoRepositoryI;

    constructor(prestamoRepository: PrestamoRepositoryI) {
        this.prestamoRepository = prestamoRepository;
    }

    public async execute(command: GetPrestamoByIdCommand): Promise<GetPrestamoByIdResult> {
        const response = await this.prestamoRepository.getPrestamoById({
            session: command.session,
            id: command.id
        });

        return {
            prestamo: response.prestamo
        };
    }

}
