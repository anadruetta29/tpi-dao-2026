import { Autor } from "@/domain/entities/autor";

export interface CreateAutorRes {
    id: string;
    autor?: Autor | null;
}
