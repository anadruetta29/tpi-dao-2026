import { type ActionState } from "@/core/types";
import { Session } from "@/domain/entities/session";
import { Prestamo } from "@/domain/entities/prestamo";
import { EstadoPrestamo } from "@/domain/entities/estado-prestamo";
import { ModalidadPrestamoLocal } from "@/domain/entities/modalidad-prestamo-local";
import { ErrorMessages, SuccessMessages } from "@/domain/messages";
import { GetAllPrestamosUseCase } from "@/domain/use-cases/prestamo/get-all-prestamos";
import { GetPrestamoByIdUseCase } from "@/domain/use-cases/prestamo/get-prestamo-by-id";
import { CreatePrestamoUseCase } from "@/domain/use-cases/prestamo/create-prestamo";
import { PrestamoApiDataSource } from "@/infrastructure/datasource/api/prestamo-api";
import { AuthStorageDataSource } from "@/infrastructure/datasource/storage/auth-storage";
import { PrestamoRepository } from "@/infrastructure/repository/prestamo";

const prestamoApiDataSource = new PrestamoApiDataSource();
const authStorageDataSource = new AuthStorageDataSource();
const prestamoRepository = new PrestamoRepository(prestamoApiDataSource);

const getAllPrestamosUseCase = new GetAllPrestamosUseCase(prestamoRepository);
const getPrestamoByIdUseCase = new GetPrestamoByIdUseCase(prestamoRepository);
const createPrestamoUseCase = new CreatePrestamoUseCase(prestamoRepository);

function resolveSession(customSession?: Session | null): Session | null {
    return customSession ?? authStorageDataSource.getSession();
}

export interface GetAllPrestamosActionParams {
    session?: Session | null;
    socio_id?: string | null;
    sede_id?: string | null;
    estado?: string | EstadoPrestamo | null;
}

export async function getAllPrestamosAction(
    params: GetAllPrestamosActionParams = {}
): Promise<ActionState<{ prestamos: Prestamo[]; total: number }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await getAllPrestamosUseCase.execute({
            session,
            socio_id: params.socio_id,
            sede_id: params.sede_id,
            estado: params.estado
        });

        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.UNEXPECTED_ERROR };
    }
}

export async function getPrestamoByIdAction(
    id: string,
    customSession?: Session | null
): Promise<ActionState<{ prestamo: Prestamo }>> {
    try {
        const session = resolveSession(customSession);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await getPrestamoByIdUseCase.execute({ session, id });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.PRESTAMO_NOT_FOUND };
    }
}

export interface CreatePrestamoActionParams {
    session?: Session | null;
    solicitud_id: string;
    modalidad: ModalidadPrestamoLocal | string;
    fechaInicio?: string | null;
    fechaVencimiento?: string | null;
}

export async function createPrestamoAction(
    params: CreatePrestamoActionParams
): Promise<ActionState<{ id: string; prestamo?: Prestamo | null }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await createPrestamoUseCase.execute({
            session,
            solicitud_id: params.solicitud_id,
            modalidad: params.modalidad,
            fechaInicio: params.fechaInicio,
            fechaVencimiento: params.fechaVencimiento
        });

        return {
            success: true,
            data: result,
            message: SuccessMessages.PRESTAMO_CREATED
        };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.PRESTAMO_CREATE_ERROR };
    }
}
