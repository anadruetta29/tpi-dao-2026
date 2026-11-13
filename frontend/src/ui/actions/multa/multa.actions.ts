import { type ActionState } from "@/core/types";
import { Session } from "@/domain/entities/session";
import { Multa } from "@/domain/entities/multa";
import { EstadoMulta } from "@/domain/entities/estado-multa";
import { MotivoMulta } from "@/domain/entities/motivo-multa";
import { ErrorMessages, SuccessMessages } from "@/domain/messages";
import { GetAllMultasUseCase } from "@/domain/use-cases/multa/get-all-multas";
import { GetMultaByIdUseCase } from "@/domain/use-cases/multa/get-multa-by-id";
import { CreateMultaUseCase } from "@/domain/use-cases/multa/create-multa";
import { PagarMultaUseCase } from "@/domain/use-cases/multa/pagar-multa";
import { AnularMultaUseCase } from "@/domain/use-cases/multa/anular-multa";
import { MultaApiDataSource } from "@/infrastructure/datasource/api/multa-api";
import { AuthStorageDataSource } from "@/infrastructure/datasource/storage/auth-storage";
import { MultaRepository } from "@/infrastructure/repository/multa";

const multaApiDataSource = new MultaApiDataSource();
const authStorageDataSource = new AuthStorageDataSource();
const multaRepository = new MultaRepository(multaApiDataSource);

const getAllMultasUseCase = new GetAllMultasUseCase(multaRepository);
const getMultaByIdUseCase = new GetMultaByIdUseCase(multaRepository);
const createMultaUseCase = new CreateMultaUseCase(multaRepository);
const pagarMultaUseCase = new PagarMultaUseCase(multaRepository);
const anularMultaUseCase = new AnularMultaUseCase(multaRepository);

function resolveSession(customSession?: Session | null): Session | null {
    return customSession ?? authStorageDataSource.getSession();
}

export interface GetAllMultasActionParams {
    session?: Session | null;
    socio_id?: string | null;
    estado?: string | EstadoMulta | null;
}

export async function getAllMultasAction(
    params: GetAllMultasActionParams = {}
): Promise<ActionState<{ multas: Multa[]; total: number }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await getAllMultasUseCase.execute({
            session,
            socio_id: params.socio_id,
            estado: params.estado
        });

        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.UNEXPECTED_ERROR };
    }
}

export async function getMultaByIdAction(
    id: string,
    customSession?: Session | null
): Promise<ActionState<{ multa: Multa }>> {
    try {
        const session = resolveSession(customSession);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await getMultaByIdUseCase.execute({ session, id });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.MULTA_NOT_FOUND };
    }
}

export interface CreateMultaActionParams {
    session?: Session | null;
    socio_id: string;
    prestamo_id: string;
    motivo: MotivoMulta | string;
    monto: number;
}

export async function createMultaAction(
    params: CreateMultaActionParams
): Promise<ActionState<{ id: string; multa?: Multa | null }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await createMultaUseCase.execute({
            session,
            socio_id: params.socio_id,
            prestamo_id: params.prestamo_id,
            motivo: params.motivo,
            monto: params.monto
        });

        return {
            success: true,
            data: result,
            message: SuccessMessages.MULTA_CREATED
        };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.MULTA_CREATE_ERROR };
    }
}

export async function pagarMultaAction(
    id: string,
    fechaPago?: string | null,
    customSession?: Session | null
): Promise<ActionState<{ id: string; multa?: Multa | null }>> {
    try {
        const session = resolveSession(customSession);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await pagarMultaUseCase.execute({
            session,
            id,
            fechaPago
        });

        return {
            success: true,
            data: result,
            message: SuccessMessages.MULTA_PAGADA
        };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.MULTA_PAGAR_ERROR };
    }
}

export async function anularMultaAction(
    id: string,
    customSession?: Session | null
): Promise<ActionState<{ id: string; multa?: Multa | null }>> {
    try {
        const session = resolveSession(customSession);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await anularMultaUseCase.execute({
            session,
            id
        });

        return {
            success: true,
            data: result,
            message: SuccessMessages.MULTA_ANULADA
        };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.MULTA_ANULAR_ERROR };
    }
}
