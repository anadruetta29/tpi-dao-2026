import { UsuarioRepositoryI } from "../../repositories/usuario";
import { Session } from "../../entities/session";
import { Usuario } from "../../entities/usuario";
import { Rol } from "../../entities/rol";

export interface CreateUsuarioCommand {
    session: Session;
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    role: Rol | string;
}

export interface CreateUsuarioResult {
    id: string;
    usuario?: Usuario | null;
}

export class CreateUsuarioUseCase {

    private readonly usuarioRepository: UsuarioRepositoryI;

    constructor(usuarioRepository: UsuarioRepositoryI) {
        this.usuarioRepository = usuarioRepository;
    }

    public async execute(command: CreateUsuarioCommand): Promise<CreateUsuarioResult> {
        const response = await this.usuarioRepository.createUsuario({
            session: command.session,
            nombre: command.nombre,
            apellido: command.apellido,
            email: command.email,
            password: command.password,
            role: command.role,
            activo: true
        });

        return {
            id: response.id,
            usuario: response.usuario
        };
    }

}
