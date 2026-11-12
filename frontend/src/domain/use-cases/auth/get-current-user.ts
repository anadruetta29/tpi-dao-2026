import { AuthRepositoryI } from "../../repositories/auth";
import { Session } from "../../entities/session";
import { Usuario } from "../../entities/usuario";

export interface GetCurrentUserCommand {
    session: Session;
}

export interface GetCurrentUserResult {
    user: Usuario;
}

export class GetCurrentUserUseCase {

    private readonly authRepository: AuthRepositoryI;

    constructor(authRepository: AuthRepositoryI) {
        this.authRepository = authRepository;
    }

    public async execute(command: GetCurrentUserCommand): Promise<GetCurrentUserResult> {
        const response = await this.authRepository.getCurrentUser({
            session: command.session
        });

        return {
            user: response.user
        };
    }

}
