import { Multa } from "@/domain/entities/multa";

export interface AnularMultaRes {
    id: string;
    multa?: Multa | null;
}
