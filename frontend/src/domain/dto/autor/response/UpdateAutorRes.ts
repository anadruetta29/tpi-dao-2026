import { Autor } from "@/domain/entities/autor";

export interface UpdateAutorRes {
    id: string;
    autor?: Autor | null;
}
