import { type ActionState } from "@/core/types";
import { type Aviso } from "@/domain/entities/aviso";
import { type Session } from "@/domain/entities/session";
import { ErrorMessages } from "@/domain/messages";
import { AvisoApiDataSource } from "@/infrastructure/datasource/api/aviso-api";
import { AvisoRepository } from "@/infrastructure/repository/aviso";

const avisoRepository = new AvisoRepository(new AvisoApiDataSource());

export async function getAllAvisosAction({ session }: { session: Session }): Promise<ActionState<Aviso[]>> {
    try {
        const { avisos } = await avisoRepository.getAllAvisos(session);
        return { success: true, data: avisos };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.UNEXPECTED_ERROR };
    }
}

export async function marcarAvisoLeidoAction({ id, session }: { id: string; session: Session }): Promise<ActionState<Aviso>> {
    try {
        const { aviso } = await avisoRepository.marcarLeido(id, session);
        return { success: true, data: aviso, message: "Aviso marcado como leído." };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.UNEXPECTED_ERROR };
    }
}
