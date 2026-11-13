import { Session } from "@/domain/entities/session";

export interface CreateLibroReq {
    session: Session;
    titulo: string;
    añoPublicacion: number;
    editorial: string;
    edicion: string;
    autoresIds?: string[];
}
