import { PrestamoRepositoryI } from "../../repositories/prestamo";
import { type Session } from "../../entities/session";
import { Prestamo } from "../../entities/prestamo";
import { EstadoPrestamo } from "../../entities/estado-prestamo";
import { ModalidadPrestamoLocal } from "../../entities/modalidad-prestamo-local";

export interface CreatePrestamoCommand {
    session: Session;
    solicitud_id: string;
    modalidad: ModalidadPrestamoLocal | string;
    fechaInicio?: string | null;
    fechaVencimiento?: string | null;
}

export interface CreatePrestamoResult {
    id: string;
    prestamo?: Prestamo | null;
}

export class CreatePrestamoUseCase {

    private readonly prestamoRepository: PrestamoRepositoryI;

    constructor(prestamoRepository: PrestamoRepositoryI) {
        this.prestamoRepository = prestamoRepository;
    }

    public async execute(command: CreatePrestamoCommand): Promise<CreatePrestamoResult> {
        const response = await this.prestamoRepository.createPrestamo({
            session: command.session,
            solicitud_id: command.solicitud_id,
            modalidad: command.modalidad,
            fechaInicio: command.fechaInicio,
            fechaVencimiento: command.fechaVencimiento,
            estado: EstadoPrestamo.ACTIVO
        });

        return {
            id: response.id,
            prestamo: response.prestamo
        };
    }

}
