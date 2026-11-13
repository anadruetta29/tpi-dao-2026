import { type ActionState } from "@/core/types";
import { type Socio } from "@/domain/entities/socio";
import { type Prestamo } from "@/domain/entities/prestamo";
import { type Multa } from "@/domain/entities/multa";
import { ErrorMessages, SuccessMessages } from "@/domain/messages";
import { GetAllSociosUseCase, type GetAllSociosCommand } from "@/domain/use-cases/socio/get-all-socios";
import { GetSocioByIdUseCase, type GetSocioByIdCommand } from "@/domain/use-cases/socio/get-socio-by-id";
import { GetSocioPrestamosUseCase, type GetSocioPrestamosCommand } from "@/domain/use-cases/socio/get-socio-prestamos";
import { GetSocioMultasUseCase, type GetSocioMultasCommand } from "@/domain/use-cases/socio/get-socio-multas";
import { CreateSocioUseCase, type CreateSocioCommand } from "@/domain/use-cases/socio/create-socio";
import { UpdateSocioUseCase, type UpdateSocioCommand } from "@/domain/use-cases/socio/update-socio";
import { DeleteSocioUseCase, type DeleteSocioCommand } from "@/domain/use-cases/socio/delete-socio";
import { SocioApiDataSource } from "@/infrastructure/datasource/api/socio-api";
import { SocioRepository } from "@/infrastructure/repository/socio";

const socioApiDataSource = new SocioApiDataSource();
const socioRepository = new SocioRepository(socioApiDataSource);

const getAllSociosUseCase = new GetAllSociosUseCase(socioRepository);
const getSocioByIdUseCase = new GetSocioByIdUseCase(socioRepository);
const getSocioPrestamosUseCase = new GetSocioPrestamosUseCase(socioRepository);
const getSocioMultasUseCase = new GetSocioMultasUseCase(socioRepository);
const createSocioUseCase = new CreateSocioUseCase(socioRepository);
const updateSocioUseCase = new UpdateSocioUseCase(socioRepository);
const deleteSocioUseCase = new DeleteSocioUseCase(socioRepository);

export async function getAllSociosAction(command: GetAllSociosCommand): Promise<ActionState<Socio[]>> {
    try {
        const result = await getAllSociosUseCase.execute(command);

        return {
            success: true,
            data: result.socios
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.GET_ALL_SOCIOS_ERROR
        };
    }
}

export async function getSocioByIdAction(command: GetSocioByIdCommand): Promise<ActionState<Socio>> {
    try {
        const result = await getSocioByIdUseCase.execute(command);

        return {
            success: true,
            data: result.socio
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.GET_SOCIO_BY_ID_ERROR
        };
    }
}

export async function getSocioPrestamosAction(command: GetSocioPrestamosCommand): Promise<ActionState<Prestamo[]>> {
    try {
        const result = await getSocioPrestamosUseCase.execute(command);

        return {
            success: true,
            data: result.prestamos
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.GET_SOCIO_PRESTAMOS_ERROR
        };
    }
}

export async function getSocioMultasAction(command: GetSocioMultasCommand): Promise<ActionState<Multa[]>> {
    try {
        const result = await getSocioMultasUseCase.execute(command);

        return {
            success: true,
            data: result.multas
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.GET_SOCIO_MULTAS_ERROR
        };
    }
}

export async function createSocioAction(command: CreateSocioCommand): Promise<ActionState<Socio>> {
    try {
        const result = await createSocioUseCase.execute(command);

        return {
            success: true,
            data: result.socio,
            message: SuccessMessages.CREATE_SOCIO_SUCCESS
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.CREATE_SOCIO_ERROR
        };
    }
}

export async function updateSocioAction(command: UpdateSocioCommand): Promise<ActionState<Socio>> {
    try {
        const result = await updateSocioUseCase.execute(command);

        return {
            success: true,
            data: result.socio,
            message: SuccessMessages.UPDATE_SOCIO_SUCCESS
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.UPDATE_SOCIO_ERROR
        };
    }
}

export async function deleteSocioAction(command: DeleteSocioCommand): Promise<ActionState<null>> {
    try {
        await deleteSocioUseCase.execute(command);

        return {
            success: true,
            data: null,
            message: SuccessMessages.DELETE_SOCIO_SUCCESS
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.DELETE_SOCIO_ERROR
        };
    }
}
