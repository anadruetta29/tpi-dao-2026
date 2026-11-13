import { type ActionState } from "@/core/types";
import { Session } from "@/domain/entities/session";
import { Remito } from "@/domain/entities/remito";
import { Ejemplar } from "@/domain/entities/ejemplar";
import { EstadoEnvio } from "@/domain/entities/estado-envio";
import { HistorialEstadoRemito } from "@/domain/entities/historial-estado-remito";
import { ErrorMessages, SuccessMessages } from "@/domain/messages";
import { GetAllRemitosUseCase } from "@/domain/use-cases/remito/get-all-remitos";
import { GetRemitoByIdUseCase } from "@/domain/use-cases/remito/get-remito-by-id";
import { CreateRemitoUseCase } from "@/domain/use-cases/remito/create-remito";
import { RegistrarDespachoRemitoUseCase } from "@/domain/use-cases/remito/registrar-despacho-remito";
import { RegistrarRecepcionRemitoUseCase } from "@/domain/use-cases/remito/registrar-recepcion-remito";
import { GetTrazabilidadRemitoUseCase } from "@/domain/use-cases/remito/get-trazabilidad-remito";
import { RemitoApiDataSource } from "@/infrastructure/datasource/api/remito-api";
import { AuthStorageDataSource } from "@/infrastructure/datasource/storage/auth-storage";
import { RemitoRepository } from "@/infrastructure/repository/remito";

const remitoApiDataSource = new RemitoApiDataSource();
const authStorageDataSource = new AuthStorageDataSource();
const remitoRepository = new RemitoRepository(remitoApiDataSource);

const getAllRemitosUseCase = new GetAllRemitosUseCase(remitoRepository);
const getRemitoByIdUseCase = new GetRemitoByIdUseCase(remitoRepository);
const createRemitoUseCase = new CreateRemitoUseCase(remitoRepository);
const registrarDespachoRemitoUseCase = new RegistrarDespachoRemitoUseCase(remitoRepository);
const registrarRecepcionRemitoUseCase = new RegistrarRecepcionRemitoUseCase(remitoRepository);
const getTrazabilidadRemitoUseCase = new GetTrazabilidadRemitoUseCase(remitoRepository);

function resolveSession(customSession?: Session | null): Session | null {
    return customSession ?? authStorageDataSource.getSession();
}

export interface GetAllRemitosActionParams {
    session?: Session | null;
    sede_origen_id?: string | null;
    sede_destino_id?: string | null;
    estado?: string | EstadoEnvio | null;
}

export async function getAllRemitosAction(
    params: GetAllRemitosActionParams = {}
): Promise<ActionState<{ remitos: Remito[]; total: number }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await getAllRemitosUseCase.execute({
            session,
            sede_origen_id: params.sede_origen_id,
            sede_destino_id: params.sede_destino_id,
            estado: params.estado
        });

        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.UNEXPECTED_ERROR };
    }
}

export async function getRemitoByIdAction(
    id: string,
    customSession?: Session | null
): Promise<ActionState<{ remito: Remito; ejemplares: Ejemplar[] }>> {
    try {
        const session = resolveSession(customSession);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await getRemitoByIdUseCase.execute({ session, id });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.REMITO_NOT_FOUND };
    }
}

export interface CreateRemitoActionParams {
    session?: Session | null;
    ejemplaresIds: string[];
    solicitud_id?: string | null;
    sede_origen_id?: string | null;
    sede_destino_id?: string | null;
    numero?: string | null;
    fechaEmision?: string | null;
}

export async function createRemitoAction(
    params: CreateRemitoActionParams
): Promise<ActionState<{ id: string; remito?: Remito | null }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await createRemitoUseCase.execute({
            session,
            ejemplaresIds: params.ejemplaresIds,
            solicitud_id: params.solicitud_id,
            sede_origen_id: params.sede_origen_id,
            sede_destino_id: params.sede_destino_id,
            numero: params.numero,
            fechaEmision: params.fechaEmision
        });

        return {
            success: true,
            data: result,
            message: SuccessMessages.REMITO_CREATED
        };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.REMITO_CREATE_ERROR };
    }
}

export interface RegistrarDespachoRemitoActionParams {
    session?: Session | null;
    id: string;
    fechaDespacho?: string | null;
}

export async function registrarDespachoRemitoAction(
    params: RegistrarDespachoRemitoActionParams
): Promise<ActionState<{ id: string; remito?: Remito | null }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await registrarDespachoRemitoUseCase.execute({
            session,
            id: params.id,
            fechaDespacho: params.fechaDespacho
        });

        return {
            success: true,
            data: result,
            message: SuccessMessages.REMITO_DESPACHADO
        };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.REMITO_DESPACHO_ERROR };
    }
}

export interface RegistrarRecepcionRemitoActionParams {
    session?: Session | null;
    id: string;
    fechaRecepcion?: string | null;
    conIncidencia?: boolean;
    observaciones?: string | null;
    ejemplaresRecibidosIds?: string[];
}

export async function registrarRecepcionRemitoAction(
    params: RegistrarRecepcionRemitoActionParams
): Promise<ActionState<{ id: string; remito?: Remito | null }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await registrarRecepcionRemitoUseCase.execute({
            session,
            id: params.id,
            fechaRecepcion: params.fechaRecepcion,
            conIncidencia: params.conIncidencia,
            observaciones: params.observaciones,
            ejemplaresRecibidosIds: params.ejemplaresRecibidosIds
        });

        return {
            success: true,
            data: result,
            message: SuccessMessages.REMITO_RECIBIDO
        };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.REMITO_RECEPCION_ERROR };
    }
}

export async function getTrazabilidadRemitoAction(
    id: string,
    customSession?: Session | null
): Promise<ActionState<{ remitoId: string; historial: HistorialEstadoRemito[] }>> {
    try {
        const session = resolveSession(customSession);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await getTrazabilidadRemitoUseCase.execute({ session, id });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.REMITO_NOT_FOUND };
    }
}
