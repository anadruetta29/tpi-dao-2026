import { type ActionState } from "@/core/types";
import { type Devolucion } from "@/domain/entities/devolucion";
import { ErrorMessages, SuccessMessages } from "@/domain/messages";
import { GetAllDevolucionesUseCase, type GetAllDevolucionesCommand } from "@/domain/use-cases/devolucion/get-all-devoluciones";
import { GetDevolucionByIdUseCase, type GetDevolucionByIdCommand } from "@/domain/use-cases/devolucion/get-devolucion-by-id";
import { CreateDevolucionUseCase, type CreateDevolucionCommand } from "@/domain/use-cases/devolucion/create-devolucion";
import { DevolucionApiDataSource } from "@/infrastructure/datasource/api/devolucion-api";
import { DevolucionRepository } from "@/infrastructure/repository/devolucion";

const devolucionApiDataSource = new DevolucionApiDataSource();
const devolucionRepository = new DevolucionRepository(devolucionApiDataSource);

const getAllDevolucionesUseCase = new GetAllDevolucionesUseCase(devolucionRepository);
const getDevolucionByIdUseCase = new GetDevolucionByIdUseCase(devolucionRepository);
const createDevolucionUseCase = new CreateDevolucionUseCase(devolucionRepository);

export async function getAllDevolucionesAction(command: GetAllDevolucionesCommand): Promise<ActionState<Devolucion[]>> {
    try {
        const result = await getAllDevolucionesUseCase.execute(command);

        return {
            success: true,
            data: result.devoluciones
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.GET_ALL_DEVOLUCIONES_ERROR
        };
    }
}

export async function getDevolucionByIdAction(command: GetDevolucionByIdCommand): Promise<ActionState<Devolucion>> {
    try {
        const result = await getDevolucionByIdUseCase.execute(command);

        return {
            success: true,
            data: result.devolucion
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.GET_DEVOLUCION_BY_ID_ERROR
        };
    }
}

export async function createDevolucionAction(command: CreateDevolucionCommand): Promise<ActionState<Devolucion>> {
    try {
        const result = await createDevolucionUseCase.execute(command);

        return {
            success: true,
            data: result.devolucion,
            message: SuccessMessages.CREATE_DEVOLUCION_SUCCESS
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.CREATE_DEVOLUCION_ERROR
        };
    }
}
