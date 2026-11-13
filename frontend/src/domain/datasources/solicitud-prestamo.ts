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

export abstract class SolicitudPrestamoDataSourceI {
    abstract getAllSolicitudesPrestamo(dto: GetAllSolicitudesPrestamoReq): Promise<GetAllSolicitudesPrestamoRes>;
    abstract getSolicitudPrestamoById(dto: GetSolicitudPrestamoByIdReq): Promise<GetSolicitudPrestamoByIdRes>;
    abstract createSolicitudLocal(dto: CreateSolicitudLocalReq): Promise<CreateSolicitudLocalRes>;
    abstract createSolicitudInterbibliotecaria(dto: CreateSolicitudInterbibliotecariaReq): Promise<CreateSolicitudInterbibliotecariaRes>;
    abstract updateSolicitudEstado(dto: UpdateSolicitudEstadoReq): Promise<UpdateSolicitudEstadoRes>;
}
