import { type GetAllLibrosReq } from "../dto/libro/request/GetAllLibrosReq";
import { type GetAllLibrosRes } from "../dto/libro/response/GetAllLibrosRes";
import { type GetLibroByIdReq } from "../dto/libro/request/GetLibroByIdReq";
import { type GetLibroByIdRes } from "../dto/libro/response/GetLibroByIdRes";
import { type GetLibroDisponibilidadReq } from "../dto/libro/request/GetLibroDisponibilidadReq";
import { type GetLibroDisponibilidadRes } from "../dto/libro/response/GetLibroDisponibilidadRes";
import { type CreateLibroReq } from "../dto/libro/request/CreateLibroReq";
import { type CreateLibroRes } from "../dto/libro/response/CreateLibroRes";
import { type UpdateLibroReq } from "../dto/libro/request/UpdateLibroReq";
import { type UpdateLibroRes } from "../dto/libro/response/UpdateLibroRes";
import { type DeleteLibroReq } from "../dto/libro/request/DeleteLibroReq";

export abstract class LibroRepositoryI {
    abstract getAllLibros(dto: GetAllLibrosReq): Promise<GetAllLibrosRes>;
    abstract getLibroById(dto: GetLibroByIdReq): Promise<GetLibroByIdRes>;
    abstract getLibroDisponibilidad(dto: GetLibroDisponibilidadReq): Promise<GetLibroDisponibilidadRes>;
    abstract createLibro(dto: CreateLibroReq): Promise<CreateLibroRes>;
    abstract updateLibro(dto: UpdateLibroReq): Promise<UpdateLibroRes>;
    abstract deleteLibro(dto: DeleteLibroReq): Promise<void>;
}
