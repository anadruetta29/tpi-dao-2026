import { Session } from "@/domain/entities/session";

export interface UpdateLibroReq {
    session: Session;
    id: string;
    titulo?: string;
    añoPublicacion?: number;
    editorial?: string;
    edicion?: string;
}
