import { type Session } from "@/domain/entities/session";
import { type Prestamo } from "@/domain/entities/prestamo";
import { type PrestamoRepositoryI } from "@/domain/repositories/prestamo";

export interface CancelarPrestamoCommand {
    id: string;
    session: Session;
}

export interface CancelarPrestamoResult {
    prestamo: Prestamo;
}

export class CancelarPrestamoUseCase {
    constructor(private readonly repository: PrestamoRepositoryI) {}

    public execute(command: CancelarPrestamoCommand): Promise<CancelarPrestamoResult> {
        return this.repository.cancelarPrestamo(command);
    }
}
