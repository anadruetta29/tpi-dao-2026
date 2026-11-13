import { type ReservaDataSourceI } from "@/domain/datasources/reserva";
import { type ReservaRepositoryI } from "@/domain/repositories/reserva";
import { type GetAllReservasReq } from "@/domain/dto/reserva/request/GetAllReservasReq";
import { type GetAllReservasRes } from "@/domain/dto/reserva/response/GetAllReservasRes";
import { type GetReservaByIdReq } from "@/domain/dto/reserva/request/GetReservaByIdReq";
import { type GetReservaByIdRes } from "@/domain/dto/reserva/response/GetReservaByIdRes";
import { type CreateReservaReq } from "@/domain/dto/reserva/request/CreateReservaReq";
import { type CreateReservaRes } from "@/domain/dto/reserva/response/CreateReservaRes";
import { type UpdateReservaEstadoReq } from "@/domain/dto/reserva/request/UpdateReservaEstadoReq";
import { type UpdateReservaEstadoRes } from "@/domain/dto/reserva/response/UpdateReservaEstadoRes";

export class ReservaRepository implements ReservaRepositoryI {

    private readonly dataSource: ReservaDataSourceI;

    constructor(dataSource: ReservaDataSourceI) {
        this.dataSource = dataSource;
    }

    public async getAllReservas(dto: GetAllReservasReq): Promise<GetAllReservasRes> {
        return await this.dataSource.getAllReservas(dto);
    }

    public async getReservaById(dto: GetReservaByIdReq): Promise<GetReservaByIdRes> {
        return await this.dataSource.getReservaById(dto);
    }

    public async createReserva(dto: CreateReservaReq): Promise<CreateReservaRes> {
        return await this.dataSource.createReserva(dto);
    }

    public async updateReservaEstado(dto: UpdateReservaEstadoReq): Promise<UpdateReservaEstadoRes> {
        return await this.dataSource.updateReservaEstado(dto);
    }

}
