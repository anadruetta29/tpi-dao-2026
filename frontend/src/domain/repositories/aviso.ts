import { type Session } from "@/domain/entities/session";
import { type Aviso } from "@/domain/entities/aviso";

export abstract class AvisoRepositoryI {
    abstract getAllAvisos(session: Session): Promise<{ avisos: Aviso[] }>;
    abstract marcarLeido(id: string, session: Session): Promise<{ aviso: Aviso }>;
}
