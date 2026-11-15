import { type CancelarPrestamoCommand, type CancelarPrestamoResult } from "./cancelar-prestamo";
import { type PrestamoRepositoryI } from "@/domain/repositories/prestamo";

export class RenovarPrestamoUseCase {
    constructor(private readonly repository: PrestamoRepositoryI) {}

    public execute(command: CancelarPrestamoCommand): Promise<CancelarPrestamoResult> {
        return this.repository.renovarPrestamo(command);
    }
}
