import { type GetAllReservasReq } from "@/domain/dto/reserva/request/GetAllReservasReq";
import { type GetAllReservasRes } from "@/domain/dto/reserva/response/GetAllReservasRes";
import { type GetReservaByIdReq } from "@/domain/dto/reserva/request/GetReservaByIdReq";
import { type GetReservaByIdRes } from "@/domain/dto/reserva/response/GetReservaByIdRes";
import { type CreateReservaReq } from "@/domain/dto/reserva/request/CreateReservaReq";
import { type CreateReservaRes } from "@/domain/dto/reserva/response/CreateReservaRes";
import { type UpdateReservaEstadoReq } from "@/domain/dto/reserva/request/UpdateReservaEstadoReq";
import { type UpdateReservaEstadoRes } from "@/domain/dto/reserva/response/UpdateReservaEstadoRes";

export abstract class ReservaRepositoryI {
    abstract getAllReservas(dto: GetAllReservasReq): Promise<GetAllReservasRes>;
    abstract getReservaById(dto: GetReservaByIdReq): Promise<GetReservaByIdRes>;
    abstract createReserva(dto: CreateReservaReq): Promise<CreateReservaRes>;
    abstract updateReservaEstado(dto: UpdateReservaEstadoReq): Promise<UpdateReservaEstadoRes>;
}
