import { type ActionState } from "@/core/types";
import { Session } from "@/domain/entities/session";
import { Libro } from "@/domain/entities/libro";
import { type LibroDisponibilidadSedeItem } from "@/domain/dto/libro/response/GetLibroDisponibilidadRes";
import { ErrorMessages, SuccessMessages } from "@/domain/messages";
import { GetAllLibrosUseCase } from "@/domain/use-cases/libro/get-all-libros";
import { GetLibroByIdUseCase } from "@/domain/use-cases/libro/get-libro-by-id";
import { GetLibroDisponibilidadUseCase } from "@/domain/use-cases/libro/get-libro-disponibilidad";
import { CreateLibroUseCase } from "@/domain/use-cases/libro/create-libro";
import { UpdateLibroUseCase } from "@/domain/use-cases/libro/update-libro";
import { DeleteLibroUseCase } from "@/domain/use-cases/libro/delete-libro";
import { LibroApiDataSource } from "@/infrastructure/datasource/api/libro-api";
import { AuthStorageDataSource } from "@/infrastructure/datasource/storage/auth-storage";
import { LibroRepository } from "@/infrastructure/repository/libro";

const libroApiDataSource = new LibroApiDataSource();
const authStorageDataSource = new AuthStorageDataSource();
const libroRepository = new LibroRepository(libroApiDataSource);

const getAllLibrosUseCase = new GetAllLibrosUseCase(libroRepository);
const getLibroByIdUseCase = new GetLibroByIdUseCase(libroRepository);
const getLibroDisponibilidadUseCase = new GetLibroDisponibilidadUseCase(libroRepository);
const createLibroUseCase = new CreateLibroUseCase(libroRepository);
const updateLibroUseCase = new UpdateLibroUseCase(libroRepository);
const deleteLibroUseCase = new DeleteLibroUseCase(libroRepository);

function resolveSession(customSession?: Session | null): Session | null {
    return customSession ?? authStorageDataSource.getSession();
}

export interface GetAllLibrosActionParams {
    session?: Session | null;
    titulo?: string | null;
    autor?: string | null;
    editorial?: string | null;
}

export async function getAllLibrosAction(
    params: GetAllLibrosActionParams = {}
): Promise<ActionState<{ libros: Libro[]; total: number }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await getAllLibrosUseCase.execute({
            session,
            titulo: params.titulo,
            autor: params.autor,
            editorial: params.editorial
        });

        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.UNEXPECTED_ERROR };
    }
}

export async function getLibroByIdAction(
    id: string,
    customSession?: Session | null
): Promise<ActionState<{ libro: Libro }>> {
    try {
        const session = resolveSession(customSession);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await getLibroByIdUseCase.execute({ session, id });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.LIBRO_NOT_FOUND };
    }
}

export async function getLibroDisponibilidadAction(
    id: string,
    customSession?: Session | null
): Promise<ActionState<{ libroId: string; sedes: LibroDisponibilidadSedeItem[] }>> {
    try {
        const session = resolveSession(customSession);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await getLibroDisponibilidadUseCase.execute({ session, id });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.LIBRO_NOT_FOUND };
    }
}

export interface CreateLibroActionParams {
    session?: Session | null;
    titulo: string;
    añoPublicacion: number;
    editorial: string;
    edicion: string;
    autoresIds?: string[];
}

export async function createLibroAction(
    params: CreateLibroActionParams
): Promise<ActionState<{ id: string; libro?: Libro | null }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await createLibroUseCase.execute({
            session,
            titulo: params.titulo,
            añoPublicacion: params.añoPublicacion,
            editorial: params.editorial,
            edicion: params.edicion,
            autoresIds: params.autoresIds
        });

        return {
            success: true,
            data: result,
            message: SuccessMessages.LIBRO_CREATED
        };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.LIBRO_CREATE_ERROR };
    }
}

export interface UpdateLibroActionParams {
    session?: Session | null;
    id: string;
    titulo?: string;
    añoPublicacion?: number;
    editorial?: string;
    edicion?: string;
}

export async function updateLibroAction(
    params: UpdateLibroActionParams
): Promise<ActionState<{ id: string; libro?: Libro | null }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await updateLibroUseCase.execute({
            session,
            id: params.id,
            titulo: params.titulo,
            añoPublicacion: params.añoPublicacion,
            editorial: params.editorial,
            edicion: params.edicion
        });

        return {
            success: true,
            data: result,
            message: SuccessMessages.LIBRO_UPDATED
        };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.LIBRO_UPDATE_ERROR };
    }
}

export async function deleteLibroAction(
    id: string,
    customSession?: Session | null
): Promise<ActionState<null>> {
    try {
        const session = resolveSession(customSession);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        await deleteLibroUseCase.execute({ session, id });
        return {
            success: true,
            data: null,
            message: SuccessMessages.LIBRO_DELETED
        };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.LIBRO_DELETE_ERROR };
    }
}
