import { Multa } from "@/domain/entities/multa";

export interface GetAllMultasRes {
    multas: Multa[];
    total: number;
}
