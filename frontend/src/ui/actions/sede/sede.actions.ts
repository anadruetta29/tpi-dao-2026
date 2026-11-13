import { type ActionState } from "@/core/types";
import { type Sede } from "@/domain/entities/sede";
import { ErrorMessages, SuccessMessages } from "@/domain/messages";
import { GetAllSedesUseCase, type GetAllSedesCommand } from "@/domain/use-cases/sede/get-all-sedes";
import { GetSedeByIdUseCase, type GetSedeByIdCommand } from "@/domain/use-cases/sede/get-sede-by-id";
import { CreateSedeUseCase, type CreateSedeCommand } from "@/domain/use-cases/sede/create-sede";
import { UpdateSedeUseCase, type UpdateSedeCommand } from "@/domain/use-cases/sede/update-sede";
import { DeleteSedeUseCase, type DeleteSedeCommand } from "@/domain/use-cases/sede/delete-sede";
import { SedeApiDataSource } from "@/infrastructure/datasource/api/sede-api";
import { SedeRepository } from "@/infrastructure/repository/sede";

const sedeApiDataSource = new SedeApiDataSource();
const sedeRepository = new SedeRepository(sedeApiDataSource);

const getAllSedesUseCase = new GetAllSedesUseCase(sedeRepository);
const getSedeByIdUseCase = new GetSedeByIdUseCase(sedeRepository);
const createSedeUseCase = new CreateSedeUseCase(sedeRepository);
const updateSedeUseCase = new UpdateSedeUseCase(sedeRepository);
const deleteSedeUseCase = new DeleteSedeUseCase(sedeRepository);

export async function getAllSedesAction(command: GetAllSedesCommand): Promise<ActionState<Sede[]>> {
    try {
        const result = await getAllSedesUseCase.execute(command);

        return {
            success: true,
            data: result.sedes
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.SEDE_LIST_ERROR
        };
    }
}

export async function getSedeByIdAction(command: GetSedeByIdCommand): Promise<ActionState<Sede>> {
    try {
        const result = await getSedeByIdUseCase.execute(command);

        return {
            success: true,
            data: result.sede
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.SEDE_DETAIL_ERROR
        };
    }
}

export async function createSedeAction(command: CreateSedeCommand): Promise<ActionState<null>> {
    try {
        await createSedeUseCase.execute(command);

        return {
            success: true,
            data: null,
            message: SuccessMessages.SEDE_CREATE_SUCCESS
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.SEDE_CREATE_ERROR
        };
    }
}

export async function updateSedeAction(command: UpdateSedeCommand): Promise<ActionState<null>> {
    try {
        await updateSedeUseCase.execute(command);

        return {
            success: true,
            data: null,
            message: SuccessMessages.SEDE_UPDATE_SUCCESS
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.SEDE_UPDATE_ERROR
        };
    }
}

export async function deleteSedeAction(command: DeleteSedeCommand): Promise<ActionState<null>> {
    try {
        await deleteSedeUseCase.execute(command);

        return {
            success: true,
            data: null,
            message: SuccessMessages.SEDE_DELETE_SUCCESS
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.SEDE_DELETE_ERROR
        };
    }
}
