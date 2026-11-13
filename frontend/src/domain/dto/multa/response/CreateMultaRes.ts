import { Multa } from "@/domain/entities/multa";

export interface CreateMultaRes {
    id: string;
    multa?: Multa | null;
}
