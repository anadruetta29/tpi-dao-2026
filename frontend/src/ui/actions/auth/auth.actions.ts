import { type ActionState } from "@/core/types";
import { Session } from "@/domain/entities/session";
import { Usuario } from "@/domain/entities/usuario";
import { SuccessMessages } from "@/domain/messages";
import { LoginUseCase, type LoginCommand } from "@/domain/use-cases/auth/login";
import { GetCurrentUserUseCase } from "@/domain/use-cases/auth/get-current-user";
import { AuthApiDataSource } from "@/infrastructure/datasource/api/auth-api";
import { AuthStorageDataSource } from "@/infrastructure/datasource/storage/auth-storage";
import { AuthRepository } from "@/infrastructure/repository/auth";

const authApiDataSource = new AuthApiDataSource();
const authStorageDataSource = new AuthStorageDataSource();
const authRepository = new AuthRepository(authApiDataSource);

const loginUseCase = new LoginUseCase(authRepository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

export interface AuthSessionData {
    session: Session;
    user: Usuario;
    accessToken: string;
}

export async function loginAction(command: LoginCommand): Promise<ActionState<AuthSessionData>> {
    try {
        const result = await loginUseCase.execute(command);
        const session = new Session(result.accessToken, result.user);
        authStorageDataSource.saveSession(session);

        return {
            success: true,
            data: {
                session,
                user: result.user,
                accessToken: result.accessToken
            },
            message: SuccessMessages.AUTH_LOGIN_SUCCESS
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "Error al iniciar sesión."
        };
    }
}

export async function getCurrentUserAction(customSession?: Session | null): Promise<ActionState<{ user: Usuario; session: Session }>> {
    try {
        const currentSession = customSession ?? authStorageDataSource.getSession();
        if (!currentSession || !currentSession.accessToken) {
            return {
                success: false,
                error: "No hay una sesión activa."
            };
        }

        const result = await getCurrentUserUseCase.execute({
            session: currentSession
        });

        const updatedSession = new Session(currentSession.accessToken, result.user);
        authStorageDataSource.saveSession(updatedSession);

        return {
            success: true,
            data: {
                user: result.user,
                session: updatedSession
            }
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "No se pudo obtener el usuario actual."
        };
    }
}

export function getStoredSessionAction(): Session | null {
    return authStorageDataSource.getSession();
}

export function logoutAction(): ActionState<null> {
    authStorageDataSource.clearSession();
    return {
        success: true,
        data: null,
        message: SuccessMessages.AUTH_LOGOUT_SUCCESS
    };
}
