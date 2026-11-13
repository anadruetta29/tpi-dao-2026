import { type SolicitudPrestamoDataSourceI } from "@/domain/datasources/solicitud-prestamo";
import { type SolicitudPrestamoRepositoryI } from "@/domain/repositories/solicitud-prestamo";
import { type GetAllSolicitudesPrestamoReq } from "@/domain/dto/solicitud-prestamo/request/GetAllSolicitudesPrestamoReq";
import { type GetAllSolicitudesPrestamoRes } from "@/domain/dto/solicitud-prestamo/response/GetAllSolicitudesPrestamoRes";
import { type GetSolicitudPrestamoByIdReq } from "@/domain/dto/solicitud-prestamo/request/GetSolicitudPrestamoByIdReq";
import { type GetSolicitudPrestamoByIdRes } from "@/domain/dto/solicitud-prestamo/response/GetSolicitudPrestamoByIdRes";
import { type CreateSolicitudLocalReq } from "@/domain/dto/solicitud-prestamo/request/CreateSolicitudLocalReq";
import { type CreateSolicitudLocalRes } from "@/domain/dto/solicitud-prestamo/response/CreateSolicitudLocalRes";
import { type CreateSolicitudInterbibliotecariaReq } from "@/domain/dto/solicitud-prestamo/request/CreateSolicitudInterbibliotecariaReq";
import { type CreateSolicitudInterbibliotecariaRes } from "@/domain/dto/solicitud-prestamo/response/CreateSolicitudInterbibliotecariaRes";
import { type UpdateSolicitudEstadoReq } from "@/domain/dto/solicitud-prestamo/request/UpdateSolicitudEstadoReq";
import { type UpdateSolicitudEstadoRes } from "@/domain/dto/solicitud-prestamo/response/UpdateSolicitudEstadoRes";

export class SolicitudPrestamoRepository implements SolicitudPrestamoRepositoryI {

    private readonly dataSource: SolicitudPrestamoDataSourceI;

    constructor(dataSource: SolicitudPrestamoDataSourceI) {
        this.dataSource = dataSource;
    }

    public async getAllSolicitudesPrestamo(dto: GetAllSolicitudesPrestamoReq): Promise<GetAllSolicitudesPrestamoRes> {
        return await this.dataSource.getAllSolicitudesPrestamo(dto);
    }

    public async getSolicitudPrestamoById(dto: GetSolicitudPrestamoByIdReq): Promise<GetSolicitudPrestamoByIdRes> {
        return await this.dataSource.getSolicitudPrestamoById(dto);
    }

    public async createSolicitudLocal(dto: CreateSolicitudLocalReq): Promise<CreateSolicitudLocalRes> {
        return await this.dataSource.createSolicitudLocal(dto);
    }

    public async createSolicitudInterbibliotecaria(dto: CreateSolicitudInterbibliotecariaReq): Promise<CreateSolicitudInterbibliotecariaRes> {
        return await this.dataSource.createSolicitudInterbibliotecaria(dto);
    }

    public async updateSolicitudEstado(dto: UpdateSolicitudEstadoReq): Promise<UpdateSolicitudEstadoRes> {
        return await this.dataSource.updateSolicitudEstado(dto);
    }

}
