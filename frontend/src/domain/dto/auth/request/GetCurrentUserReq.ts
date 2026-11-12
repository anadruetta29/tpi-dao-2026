import { Session } from "@/domain/entities/session";

export interface GetCurrentUserReq {
    session: Session;
}
