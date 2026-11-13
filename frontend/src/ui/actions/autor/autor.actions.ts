import { type ActionState } from "@/core/types";
import { Session } from "@/domain/entities/session";
import { Autor } from "@/domain/entities/autor";
import { ErrorMessages, SuccessMessages } from "@/domain/messages";
import { GetAllAutoresUseCase } from "@/domain/use-cases/autor/get-all-autores";
import { CreateAutorUseCase } from "@/domain/use-cases/autor/create-autor";
import { AutorApiDataSource } from "@/infrastructure/datasource/api/autor-api";
import { AuthStorageDataSource } from "@/infrastructure/datasource/storage/auth-storage";
import { AutorRepository } from "@/infrastructure/repository/autor";

const autorApiDataSource = new AutorApiDataSource();
const authStorageDataSource = new AuthStorageDataSource();
const autorRepository = new AutorRepository(autorApiDataSource);

const getAllAutoresUseCase = new GetAllAutoresUseCase(autorRepository);
const createAutorUseCase = new CreateAutorUseCase(autorRepository);

function resolveSession(customSession?: Session | null): Session | null {
    return customSession ?? authStorageDataSource.getSession();
}

export async function getAllAutoresAction(
    customSession?: Session | null
): Promise<ActionState<{ autores: Autor[]; total: number }>> {
    try {
        const session = resolveSession(customSession);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await getAllAutoresUseCase.execute({ session });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.UNEXPECTED_ERROR };
    }
}

export interface CreateAutorActionParams {
    session?: Session | null;
    nombre: string;
    apellido: string;
}

export async function createAutorAction(
    params: CreateAutorActionParams
): Promise<ActionState<{ id: string; autor?: Autor | null }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await createAutorUseCase.execute({
            session,
            nombre: params.nombre,
            apellido: params.apellido
        });

        return {
            success: true,
            data: result,
            message: SuccessMessages.AUTOR_CREATED
        };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.AUTOR_CREATE_ERROR };
    }
}
