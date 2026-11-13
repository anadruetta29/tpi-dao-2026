import { type ActionState } from "@/core/types";
import { Session } from "@/domain/entities/session";
import { Ejemplar } from "@/domain/entities/ejemplar";
import { EstadoEjemplar } from "@/domain/entities/estado-ejemplar";
import { ErrorMessages, SuccessMessages } from "@/domain/messages";
import { GetAllEjemplaresUseCase } from "@/domain/use-cases/ejemplar/get-all-ejemplares";
import { GetEjemplarByIdUseCase } from "@/domain/use-cases/ejemplar/get-ejemplar-by-id";
import { CreateEjemplarUseCase } from "@/domain/use-cases/ejemplar/create-ejemplar";
import { EjemplarApiDataSource } from "@/infrastructure/datasource/api/ejemplar-api";
import { AuthStorageDataSource } from "@/infrastructure/datasource/storage/auth-storage";
import { EjemplarRepository } from "@/infrastructure/repository/ejemplar";

const ejemplarApiDataSource = new EjemplarApiDataSource();
const authStorageDataSource = new AuthStorageDataSource();
const ejemplarRepository = new EjemplarRepository(ejemplarApiDataSource);

const getAllEjemplaresUseCase = new GetAllEjemplaresUseCase(ejemplarRepository);
const getEjemplarByIdUseCase = new GetEjemplarByIdUseCase(ejemplarRepository);
const createEjemplarUseCase = new CreateEjemplarUseCase(ejemplarRepository);

function resolveSession(customSession?: Session | null): Session | null {
    return customSession ?? authStorageDataSource.getSession();
}

export interface GetAllEjemplaresActionParams {
    session?: Session | null;
    libro_id?: string | null;
    sede_id?: string | null;
    estado?: string | EstadoEjemplar | null;
}

export async function getAllEjemplaresAction(
    params: GetAllEjemplaresActionParams = {}
): Promise<ActionState<{ ejemplares: Ejemplar[]; total: number }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await getAllEjemplaresUseCase.execute({
            session,
            libro_id: params.libro_id,
            sede_id: params.sede_id,
            estado: params.estado
        });

        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.UNEXPECTED_ERROR };
    }
}

export async function getEjemplarByIdAction(
    id: string,
    customSession?: Session | null
): Promise<ActionState<{ ejemplar: Ejemplar }>> {
    try {
        const session = resolveSession(customSession);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await getEjemplarByIdUseCase.execute({ session, id });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.EJEMPLAR_NOT_FOUND };
    }
}

export interface CreateEjemplarActionParams {
    session?: Session | null;
    codigo: string;
    libro_id: string;
    sede_id: string;
}

export async function createEjemplarAction(
    params: CreateEjemplarActionParams
): Promise<ActionState<{ id: string; ejemplar?: Ejemplar | null }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await createEjemplarUseCase.execute({
            session,
            codigo: params.codigo,
            libro_id: params.libro_id,
            sede_id: params.sede_id
        });

        return {
            success: true,
            data: result,
            message: SuccessMessages.EJEMPLAR_CREATED
        };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.EJEMPLAR_CREATE_ERROR };
    }
}
