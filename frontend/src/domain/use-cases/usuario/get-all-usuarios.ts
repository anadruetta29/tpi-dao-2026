import { UsuarioRepositoryI } from "../../repositories/usuario";
import { Session } from "../../entities/session";
import { Usuario } from "../../entities/usuario";
import { Rol } from "../../entities/rol";
import { UsuarioFilters } from "../../filters/usuario-filters";

export interface GetAllUsuariosCommand {
    session: Session;
    role?: string | Rol | null;
    activo?: boolean | null;
    filters?: UsuarioFilters;
}

export interface GetAllUsuariosResult {
    usuarios: Usuario[];
    total: number;
}

export class GetAllUsuariosUseCase {

    private readonly usuarioRepository: UsuarioRepositoryI;

    constructor(usuarioRepository: UsuarioRepositoryI) {
        this.usuarioRepository = usuarioRepository;
    }

    public async execute(command: GetAllUsuariosCommand): Promise<GetAllUsuariosResult> {
        const response = await this.usuarioRepository.getAllUsuarios({
            session: command.session,
            role: command.role,
            activo: command.activo,
            filters: command.filters
        });

        return {
            usuarios: response.usuarios,
            total: response.total
        };
    }

}
