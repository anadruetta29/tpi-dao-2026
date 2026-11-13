import { LibroDataSourceI } from "@/domain/datasources/libro";
import { LibroRepositoryI } from "@/domain/repositories/libro";
import { type GetAllLibrosReq } from "@/domain/dto/libro/request/GetAllLibrosReq";
import { type GetAllLibrosRes } from "@/domain/dto/libro/response/GetAllLibrosRes";
import { type GetLibroByIdReq } from "@/domain/dto/libro/request/GetLibroByIdReq";
import { type GetLibroByIdRes } from "@/domain/dto/libro/response/GetLibroByIdRes";
import { type GetLibroDisponibilidadReq } from "@/domain/dto/libro/request/GetLibroDisponibilidadReq";
import { type GetLibroDisponibilidadRes } from "@/domain/dto/libro/response/GetLibroDisponibilidadRes";
import { type CreateLibroReq } from "@/domain/dto/libro/request/CreateLibroReq";
import { type CreateLibroRes } from "@/domain/dto/libro/response/CreateLibroRes";
import { type UpdateLibroReq } from "@/domain/dto/libro/request/UpdateLibroReq";
import { type UpdateLibroRes } from "@/domain/dto/libro/response/UpdateLibroRes";
import { type DeleteLibroReq } from "@/domain/dto/libro/request/DeleteLibroReq";

export class LibroRepository implements LibroRepositoryI {

    private readonly dataSource: LibroDataSourceI;

    constructor(dataSource: LibroDataSourceI) {
        this.dataSource = dataSource;
    }

    public async getAllLibros(dto: GetAllLibrosReq): Promise<GetAllLibrosRes> {
        return await this.dataSource.getAllLibros(dto);
    }

    public async getLibroById(dto: GetLibroByIdReq): Promise<GetLibroByIdRes> {
        return await this.dataSource.getLibroById(dto);
    }

    public async getLibroDisponibilidad(dto: GetLibroDisponibilidadReq): Promise<GetLibroDisponibilidadRes> {
        return await this.dataSource.getLibroDisponibilidad(dto);
    }

    public async createLibro(dto: CreateLibroReq): Promise<CreateLibroRes> {
        return await this.dataSource.createLibro(dto);
    }

    public async updateLibro(dto: UpdateLibroReq): Promise<UpdateLibroRes> {
        return await this.dataSource.updateLibro(dto);
    }

    public async deleteLibro(dto: DeleteLibroReq): Promise<void> {
        return await this.dataSource.deleteLibro(dto);
    }

}
