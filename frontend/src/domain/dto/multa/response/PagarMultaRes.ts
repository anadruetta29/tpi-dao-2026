import { Multa } from "@/domain/entities/multa";

export interface PagarMultaRes {
    id: string;
    multa?: Multa | null;
}
