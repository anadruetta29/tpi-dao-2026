import { PrestamoRepositoryI } from "../../repositories/prestamo";
import { type Session } from "../../entities/session";
import { Prestamo } from "../../entities/prestamo";
import { EstadoPrestamo } from "../../entities/estado-prestamo";
import { type PrestamoFilters } from "../../filters/prestamo-filters";

export interface GetAllPrestamosCommand {
    session: Session;
    socio_id?: string | null;
    sede_id?: string | null;
    estado?: string | EstadoPrestamo | null;
    filters?: PrestamoFilters;
}

export interface GetAllPrestamosResult {
    prestamos: Prestamo[];
    total: number;
}

export class GetAllPrestamosUseCase {

    private readonly prestamoRepository: PrestamoRepositoryI;

    constructor(prestamoRepository: PrestamoRepositoryI) {
        this.prestamoRepository = prestamoRepository;
    }

    public async execute(command: GetAllPrestamosCommand): Promise<GetAllPrestamosResult> {
        const response = await this.prestamoRepository.getAllPrestamos({
            session: command.session,
            socio_id: command.socio_id,
            sede_id: command.sede_id,
            estado: command.estado,
            filters: command.filters
        });

        return {
            prestamos: response.prestamos,
            total: response.total
        };
    }

}
