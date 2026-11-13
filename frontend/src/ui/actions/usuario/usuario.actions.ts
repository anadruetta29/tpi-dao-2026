import { type ActionState } from "@/core/types";
import { Session } from "@/domain/entities/session";
import { Usuario } from "@/domain/entities/usuario";
import { Rol } from "@/domain/entities/rol";
import { ErrorMessages, SuccessMessages } from "@/domain/messages";
import { GetAllUsuariosUseCase } from "@/domain/use-cases/usuario/get-all-usuarios";
import { GetUsuarioByIdUseCase } from "@/domain/use-cases/usuario/get-usuario-by-id";
import { CreateUsuarioUseCase } from "@/domain/use-cases/usuario/create-usuario";
import { UpdateUsuarioUseCase } from "@/domain/use-cases/usuario/update-usuario";
import { UsuarioApiDataSource } from "@/infrastructure/datasource/api/usuario-api";
import { AuthStorageDataSource } from "@/infrastructure/datasource/storage/auth-storage";
import { UsuarioRepository } from "@/infrastructure/repository/usuario";

const usuarioApiDataSource = new UsuarioApiDataSource();
const authStorageDataSource = new AuthStorageDataSource();
const usuarioRepository = new UsuarioRepository(usuarioApiDataSource);

const getAllUsuariosUseCase = new GetAllUsuariosUseCase(usuarioRepository);
const getUsuarioByIdUseCase = new GetUsuarioByIdUseCase(usuarioRepository);
const createUsuarioUseCase = new CreateUsuarioUseCase(usuarioRepository);
const updateUsuarioUseCase = new UpdateUsuarioUseCase(usuarioRepository);

function resolveSession(customSession?: Session | null): Session | null {
    return customSession ?? authStorageDataSource.getSession();
}

export interface GetAllUsuariosActionParams {
    session?: Session | null;
    role?: string | Rol | null;
    activo?: boolean | null;
}

export async function getAllUsuariosAction(
    params: GetAllUsuariosActionParams = {}
): Promise<ActionState<{ usuarios: Usuario[]; total: number }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return {
                success: false,
                error: ErrorMessages.AUTH_UNAUTHORIZED
            };
        }

        const result = await getAllUsuariosUseCase.execute({
            session,
            role: params.role,
            activo: params.activo
        });

        return {
            success: true,
            data: result
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.UNEXPECTED_ERROR
        };
    }
}

export async function getUsuarioByIdAction(
    id: string,
    customSession?: Session | null
): Promise<ActionState<{ usuario: Usuario }>> {
    try {
        const session = resolveSession(customSession);
        if (!session?.accessToken) {
            return {
                success: false,
                error: ErrorMessages.AUTH_UNAUTHORIZED
            };
        }

        const result = await getUsuarioByIdUseCase.execute({
            session,
            id
        });

        return {
            success: true,
            data: result
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.USUARIO_NOT_FOUND
        };
    }
}

export interface CreateUsuarioActionParams {
    session?: Session | null;
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    role: Rol | string;
}

export async function createUsuarioAction(
    params: CreateUsuarioActionParams
): Promise<ActionState<{ id: string; usuario?: Usuario | null }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return {
                success: false,
                error: ErrorMessages.AUTH_UNAUTHORIZED
            };
        }

        const result = await createUsuarioUseCase.execute({
            session,
            nombre: params.nombre,
            apellido: params.apellido,
            email: params.email,
            password: params.password,
            role: params.role
        });

        return {
            success: true,
            data: result,
            message: SuccessMessages.USUARIO_CREATED
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.USUARIO_CREATE_ERROR
        };
    }
}

export interface UpdateUsuarioActionParams {
    session?: Session | null;
    id: string;
    nombre?: string;
    apellido?: string;
    email?: string;
    password?: string;
    activo?: boolean;
    role?: Rol | string;
}

export async function updateUsuarioAction(
    params: UpdateUsuarioActionParams
): Promise<ActionState<{ id: string; usuario?: Usuario | null }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return {
                success: false,
                error: ErrorMessages.AUTH_UNAUTHORIZED
            };
        }

        const result = await updateUsuarioUseCase.execute({
            session,
            id: params.id,
            nombre: params.nombre,
            apellido: params.apellido,
            email: params.email,
            password: params.password,
            activo: params.activo,
            role: params.role
        });

        return {
            success: true,
            data: result,
            message: SuccessMessages.USUARIO_UPDATED
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.USUARIO_UPDATE_ERROR
        };
    }
}
