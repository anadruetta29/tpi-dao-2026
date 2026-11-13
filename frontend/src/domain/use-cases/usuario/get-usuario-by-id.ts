import { UsuarioRepositoryI } from "../../repositories/usuario";
import { Session } from "../../entities/session";
import { Usuario } from "../../entities/usuario";

export interface GetUsuarioByIdCommand {
    session: Session;
    id: string;
}

export interface GetUsuarioByIdResult {
    usuario: Usuario;
}

export class GetUsuarioByIdUseCase {

    private readonly usuarioRepository: UsuarioRepositoryI;

    constructor(usuarioRepository: UsuarioRepositoryI) {
        this.usuarioRepository = usuarioRepository;
    }

    public async execute(command: GetUsuarioByIdCommand): Promise<GetUsuarioByIdResult> {
        const response = await this.usuarioRepository.getUsuarioById({
            session: command.session,
            id: command.id
        });

        return {
            usuario: response.usuario
        };
    }

}
