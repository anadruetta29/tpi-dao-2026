import { type RegistrarEmpaqueRemitoReq } from "@/domain/dto/remito/request/RegistrarEmpaqueRemitoReq";
import { type RegistrarEmpaqueRemitoRes } from "@/domain/dto/remito/response/RegistrarEmpaqueRemitoRes";
import { type RemitoRepositoryI } from "@/domain/repositories/remito";

export class RegistrarEmpaqueRemitoUseCase {

    private readonly remitoRepository: RemitoRepositoryI;

    constructor(remitoRepository: RemitoRepositoryI) {
        this.remitoRepository = remitoRepository;
    }

    public async execute(command: RegistrarEmpaqueRemitoReq): Promise<RegistrarEmpaqueRemitoRes> {
        return await this.remitoRepository.registrarEmpaque(command);
    }

}
