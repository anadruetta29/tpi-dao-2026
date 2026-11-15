import { type AvisoDataSourceI } from "@/domain/datasources/aviso";
import { type Aviso } from "@/domain/entities/aviso";
import { type Session } from "@/domain/entities/session";
import { AvisoRepositoryI } from "@/domain/repositories/aviso";

export class AvisoRepository implements AvisoRepositoryI {
    constructor(private readonly dataSource: AvisoDataSourceI) {}

    public getAllAvisos(session: Session): Promise<{ avisos: Aviso[] }> {
        return this.dataSource.getAllAvisos(session);
    }

    public marcarLeido(id: string, session: Session): Promise<{ aviso: Aviso }> {
        return this.dataSource.marcarLeido(id, session);
    }
}
