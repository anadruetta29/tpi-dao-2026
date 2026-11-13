import { PrestamoDataSourceI } from "@/domain/datasources/prestamo";
import { PrestamoRepositoryI } from "@/domain/repositories/prestamo";
import { type GetAllPrestamosReq } from "@/domain/dto/prestamo/request/GetAllPrestamosReq";
import { type GetAllPrestamosRes } from "@/domain/dto/prestamo/response/GetAllPrestamosRes";
import { type GetPrestamoByIdReq } from "@/domain/dto/prestamo/request/GetPrestamoByIdReq";
import { type GetPrestamoByIdRes } from "@/domain/dto/prestamo/response/GetPrestamoByIdRes";
import { type CreatePrestamoReq } from "@/domain/dto/prestamo/request/CreatePrestamoReq";
import { type CreatePrestamoRes } from "@/domain/dto/prestamo/response/CreatePrestamoRes";

export class PrestamoRepository implements PrestamoRepositoryI {

    private readonly dataSource: PrestamoDataSourceI;

    constructor(dataSource: PrestamoDataSourceI) {
        this.dataSource = dataSource;
    }

    public async getAllPrestamos(dto: GetAllPrestamosReq): Promise<GetAllPrestamosRes> {
        return await this.dataSource.getAllPrestamos(dto);
    }

    public async getPrestamoById(dto: GetPrestamoByIdReq): Promise<GetPrestamoByIdRes> {
        return await this.dataSource.getPrestamoById(dto);
    }

    public async createPrestamo(dto: CreatePrestamoReq): Promise<CreatePrestamoRes> {
        return await this.dataSource.createPrestamo(dto);
    }

}
