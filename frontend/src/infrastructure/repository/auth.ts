import { AuthDataSourceI } from "@/domain/datasources/auth";
import { AuthRepositoryI } from "@/domain/repositories/auth";
import { type LoginReq } from "@/domain/dto/auth/request/LoginReq";
import { type LoginRes } from "@/domain/dto/auth/response/LoginRes";
import { type GetCurrentUserReq } from "@/domain/dto/auth/request/GetCurrentUserReq";
import { type GetCurrentUserRes } from "@/domain/dto/auth/response/GetCurrentUserRes";

export class AuthRepository implements AuthRepositoryI {

    private readonly dataSource: AuthDataSourceI;

    constructor(dataSource: AuthDataSourceI) {
        this.dataSource = dataSource;
    }

    public async login(dto: LoginReq): Promise<LoginRes> {
        return await this.dataSource.login(dto);
    }

    public async getCurrentUser(dto: GetCurrentUserReq): Promise<GetCurrentUserRes> {
        return await this.dataSource.getCurrentUser(dto);
    }

}
