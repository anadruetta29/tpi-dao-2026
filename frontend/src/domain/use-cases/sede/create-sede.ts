import { SedeRepositoryI } from "../../repositories/sede";
import { type Session } from "../../entities/session";

export interface CreateSedeCommand {
    nombre: string;
    telefono: string;
    email: string;
    horarioAtencion: string;
    session: Session;
}

export class CreateSedeUseCase {

    private readonly sedeRepository: SedeRepositoryI;

    constructor(sedeRepository: SedeRepositoryI) {
        this.sedeRepository = sedeRepository;
    }

    public async execute(command: CreateSedeCommand): Promise<void> {
        await this.sedeRepository.createSede({
            nombre: command.nombre,
            telefono: command.telefono,
            email: command.email,
            horarioAtencion: command.horarioAtencion,
            session: command.session
        });
    }

}
