import { SedeRepositoryI } from "../../repositories/sede";
import { type Session } from "../../entities/session";

export interface UpdateSedeCommand {
    id: string;
    nombre: string;
    telefono: string;
    email: string;
    horarioAtencion: string;
    session: Session;
}

export class UpdateSedeUseCase {

    private readonly sedeRepository: SedeRepositoryI;

    constructor(sedeRepository: SedeRepositoryI) {
        this.sedeRepository = sedeRepository;
    }

    public async execute(command: UpdateSedeCommand): Promise<void> {
        await this.sedeRepository.updateSede({
            id: command.id,
            nombre: command.nombre,
            telefono: command.telefono,
            email: command.email,
            horarioAtencion: command.horarioAtencion,
            session: command.session
        });
    }

}
