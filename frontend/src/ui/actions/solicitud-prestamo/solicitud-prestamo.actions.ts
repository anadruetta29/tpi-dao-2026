import { type ActionState } from "@/core/types";
import { type SolicitudPrestamo } from "@/domain/entities/solicitud-prestamo";
import { ErrorMessages, SuccessMessages } from "@/domain/messages";
import { GetAllSolicitudesPrestamoUseCase, type GetAllSolicitudesPrestamoCommand } from "@/domain/use-cases/solicitud-prestamo/get-all-solicitudes-prestamo";
import { GetSolicitudPrestamoByIdUseCase, type GetSolicitudPrestamoByIdCommand } from "@/domain/use-cases/solicitud-prestamo/get-solicitud-prestamo-by-id";
import { CreateSolicitudLocalUseCase, type CreateSolicitudLocalCommand } from "@/domain/use-cases/solicitud-prestamo/create-solicitud-local";
import { CreateSolicitudInterbibliotecariaUseCase, type CreateSolicitudInterbibliotecariaCommand } from "@/domain/use-cases/solicitud-prestamo/create-solicitud-interbibliotecaria";
import { UpdateSolicitudEstadoUseCase, type UpdateSolicitudEstadoCommand } from "@/domain/use-cases/solicitud-prestamo/update-solicitud-estado";
import { SolicitudPrestamoApiDataSource } from "@/infrastructure/datasource/api/solicitud-prestamo-api";
import { SolicitudPrestamoRepository } from "@/infrastructure/repository/solicitud-prestamo";

const solicitudPrestamoApiDataSource = new SolicitudPrestamoApiDataSource();
const solicitudPrestamoRepository = new SolicitudPrestamoRepository(solicitudPrestamoApiDataSource);

const getAllSolicitudesPrestamoUseCase = new GetAllSolicitudesPrestamoUseCase(solicitudPrestamoRepository);
const getSolicitudPrestamoByIdUseCase = new GetSolicitudPrestamoByIdUseCase(solicitudPrestamoRepository);
const createSolicitudLocalUseCase = new CreateSolicitudLocalUseCase(solicitudPrestamoRepository);
const createSolicitudInterbibliotecariaUseCase = new CreateSolicitudInterbibliotecariaUseCase(solicitudPrestamoRepository);
const updateSolicitudEstadoUseCase = new UpdateSolicitudEstadoUseCase(solicitudPrestamoRepository);

export async function getAllSolicitudesPrestamoAction(command: GetAllSolicitudesPrestamoCommand): Promise<ActionState<SolicitudPrestamo[]>> {
    try {
        const result = await getAllSolicitudesPrestamoUseCase.execute(command);

        return {
            success: true,
            data: result.solicitudes
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.GET_ALL_SOLICITUDES_PRESTAMO_ERROR
        };
    }
}

export async function getSolicitudPrestamoByIdAction(command: GetSolicitudPrestamoByIdCommand): Promise<ActionState<SolicitudPrestamo>> {
    try {
        const result = await getSolicitudPrestamoByIdUseCase.execute(command);

        return {
            success: true,
            data: result.solicitud
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.GET_SOLICITUD_PRESTAMO_BY_ID_ERROR
        };
    }
}

export async function createSolicitudLocalAction(command: CreateSolicitudLocalCommand): Promise<ActionState<SolicitudPrestamo>> {
    try {
        const result = await createSolicitudLocalUseCase.execute(command);

        return {
            success: true,
            data: result.solicitud,
            message: SuccessMessages.CREATE_SOLICITUD_LOCAL_SUCCESS
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.CREATE_SOLICITUD_LOCAL_ERROR
        };
    }
}

export async function createSolicitudInterbibliotecariaAction(command: CreateSolicitudInterbibliotecariaCommand): Promise<ActionState<SolicitudPrestamo>> {
    try {
        const result = await createSolicitudInterbibliotecariaUseCase.execute(command);

        return {
            success: true,
            data: result.solicitud,
            message: SuccessMessages.CREATE_SOLICITUD_INTERBIBLIOTECARIA_SUCCESS
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.CREATE_SOLICITUD_INTERBIBLIOTECARIA_ERROR
        };
    }
}

export async function updateSolicitudEstadoAction(command: UpdateSolicitudEstadoCommand): Promise<ActionState<SolicitudPrestamo>> {
    try {
        const result = await updateSolicitudEstadoUseCase.execute(command);

        return {
            success: true,
            data: result.solicitud,
            message: SuccessMessages.UPDATE_SOLICITUD_ESTADO_SUCCESS
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.UPDATE_SOLICITUD_ESTADO_ERROR
        };
    }
}
