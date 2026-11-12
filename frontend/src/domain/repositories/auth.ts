import { type LoginReq } from "../dto/auth/request/LoginReq";
import { type LoginRes } from "../dto/auth/response/LoginRes";
import { type GetCurrentUserReq } from "../dto/auth/request/GetCurrentUserReq";
import { type GetCurrentUserRes } from "../dto/auth/response/GetCurrentUserRes";

export abstract class AuthRepositoryI {
    abstract login(dto: LoginReq): Promise<LoginRes>;
    abstract getCurrentUser(dto: GetCurrentUserReq): Promise<GetCurrentUserRes>;
}
