import { type ActionState } from "@/core/types";
import { type Reserva } from "@/domain/entities/reserva";
import { ErrorMessages, SuccessMessages } from "@/domain/messages";
import { GetAllReservasUseCase, type GetAllReservasCommand } from "@/domain/use-cases/reserva/get-all-reservas";
import { GetReservaByIdUseCase, type GetReservaByIdCommand } from "@/domain/use-cases/reserva/get-reserva-by-id";
import { CreateReservaUseCase, type CreateReservaCommand } from "@/domain/use-cases/reserva/create-reserva";
import { UpdateReservaEstadoUseCase, type UpdateReservaEstadoCommand } from "@/domain/use-cases/reserva/update-reserva-estado";
import { ReservaApiDataSource } from "@/infrastructure/datasource/api/reserva-api";
import { ReservaRepository } from "@/infrastructure/repository/reserva";

const reservaApiDataSource = new ReservaApiDataSource();
const reservaRepository = new ReservaRepository(reservaApiDataSource);

const getAllReservasUseCase = new GetAllReservasUseCase(reservaRepository);
const getReservaByIdUseCase = new GetReservaByIdUseCase(reservaRepository);
const createReservaUseCase = new CreateReservaUseCase(reservaRepository);
const updateReservaEstadoUseCase = new UpdateReservaEstadoUseCase(reservaRepository);

export async function getAllReservasAction(command: GetAllReservasCommand): Promise<ActionState<Reserva[]>> {
    try {
        const result = await getAllReservasUseCase.execute(command);

        return {
            success: true,
            data: result.reservas
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.GET_ALL_RESERVAS_ERROR
        };
    }
}

export async function getReservaByIdAction(command: GetReservaByIdCommand): Promise<ActionState<Reserva>> {
    try {
        const result = await getReservaByIdUseCase.execute(command);

        return {
            success: true,
            data: result.reserva
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.GET_RESERVA_BY_ID_ERROR
        };
    }
}

export async function createReservaAction(command: CreateReservaCommand): Promise<ActionState<Reserva>> {
    try {
        const result = await createReservaUseCase.execute(command);

        return {
            success: true,
            data: result.reserva,
            message: SuccessMessages.CREATE_RESERVA_SUCCESS
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.CREATE_RESERVA_ERROR
        };
    }
}

export async function updateReservaEstadoAction(command: UpdateReservaEstadoCommand): Promise<ActionState<Reserva>> {
    try {
        const result = await updateReservaEstadoUseCase.execute(command);

        return {
            success: true,
            data: result.reserva,
            message: SuccessMessages.UPDATE_RESERVA_ESTADO_SUCCESS
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || ErrorMessages.UPDATE_RESERVA_ESTADO_ERROR
        };
    }
}
