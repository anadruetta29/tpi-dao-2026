import { type CancelarPrestamoReq } from "@/domain/dto/prestamo/request/CancelarPrestamoReq";
import { type CancelarPrestamoRes } from "@/domain/dto/prestamo/response/CancelarPrestamoRes";
import { type GetAllPrestamosReq } from "../dto/prestamo/request/GetAllPrestamosReq";
import { type GetAllPrestamosRes } from "../dto/prestamo/response/GetAllPrestamosRes";
import { type GetPrestamoByIdReq } from "../dto/prestamo/request/GetPrestamoByIdReq";
import { type GetPrestamoByIdRes } from "../dto/prestamo/response/GetPrestamoByIdRes";
import { type CreatePrestamoReq } from "../dto/prestamo/request/CreatePrestamoReq";
import { type CreatePrestamoRes } from "../dto/prestamo/response/CreatePrestamoRes";

export abstract class PrestamoRepositoryI {
    abstract getAllPrestamos(dto: GetAllPrestamosReq): Promise<GetAllPrestamosRes>;
    abstract getPrestamoById(dto: GetPrestamoByIdReq): Promise<GetPrestamoByIdRes>;
    abstract createPrestamo(dto: CreatePrestamoReq): Promise<CreatePrestamoRes>;
    abstract renovarPrestamo(dto: CancelarPrestamoReq): Promise<CancelarPrestamoRes>;
    abstract cancelarPrestamo(dto: CancelarPrestamoReq): Promise<CancelarPrestamoRes>;
}
