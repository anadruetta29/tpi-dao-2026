import { UsuarioRepositoryI } from "../../repositories/usuario";
import { Session } from "../../entities/session";
import { Usuario } from "../../entities/usuario";
import { Rol } from "../../entities/rol";

export interface UpdateUsuarioCommand {
    session: Session;
    id: string;
    nombre?: string;
    apellido?: string;
    email?: string;
    password?: string;
    activo?: boolean;
    role?: Rol | string;
}

export interface UpdateUsuarioResult {
    id: string;
    usuario?: Usuario | null;
}

export class UpdateUsuarioUseCase {

    private readonly usuarioRepository: UsuarioRepositoryI;

    constructor(usuarioRepository: UsuarioRepositoryI) {
        this.usuarioRepository = usuarioRepository;
    }

    public async execute(command: UpdateUsuarioCommand): Promise<UpdateUsuarioResult> {
        const response = await this.usuarioRepository.updateUsuario({
            session: command.session,
            id: command.id,
            nombre: command.nombre,
            apellido: command.apellido,
            email: command.email,
            password: command.password,
            activo: command.activo,
            role: command.role
        });

        return {
            id: response.id,
            usuario: response.usuario
        };
    }

}
