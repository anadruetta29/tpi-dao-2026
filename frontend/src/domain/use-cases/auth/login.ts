import { AuthRepositoryI } from "../../repositories/auth";
import { Usuario } from "../../entities/usuario";

export interface LoginCommand {
    email: string;
    password: string;
}

export interface LoginResult {
    accessToken: string;
    user: Usuario;
}

export class LoginUseCase {

    private readonly authRepository: AuthRepositoryI;

    constructor(authRepository: AuthRepositoryI) {
        this.authRepository = authRepository;
    }

    public async execute(command: LoginCommand): Promise<LoginResult> {
        const response = await this.authRepository.login({
            email: command.email,
            password: command.password
        });

        return {
            accessToken: response.accessToken,
            user: response.user
        };
    }

}
