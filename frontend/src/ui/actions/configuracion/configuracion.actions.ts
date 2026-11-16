import { type ActionState } from "@/core/types";
import { MotivoMulta } from "@/domain/entities/motivo-multa";
import { Session } from "@/domain/entities/session";
import { TarifaMulta } from "@/domain/entities/tarifa-multa";
import { ErrorMessages } from "@/domain/messages";
import { GetAllTarifasMultaUseCase } from "@/domain/use-cases/configuracion/get-all-tarifas-multa";
import { UpdateTarifaMultaUseCase } from "@/domain/use-cases/configuracion/update-tarifa-multa";
import { ConfiguracionApiDataSource } from "@/infrastructure/datasource/api/configuracion-api";
import { AuthStorageDataSource } from "@/infrastructure/datasource/storage/auth-storage";
import { ConfiguracionRepository } from "@/infrastructure/repository/configuracion";

const configuracionApiDataSource = new ConfiguracionApiDataSource();
const authStorageDataSource = new AuthStorageDataSource();
const configuracionRepository = new ConfiguracionRepository(configuracionApiDataSource);

const getAllTarifasMultaUseCase = new GetAllTarifasMultaUseCase(configuracionRepository);
const updateTarifaMultaUseCase = new UpdateTarifaMultaUseCase(configuracionRepository);

function resolveSession(customSession?: Session | null): Session | null {
    return customSession ?? authStorageDataSource.getSession();
}

export async function getAllTarifasMultaAction(
    customSession?: Session | null
): Promise<ActionState<{ tarifas: TarifaMulta[] }>> {
    try {
        const session = resolveSession(customSession);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await getAllTarifasMultaUseCase.execute({ session });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.UNEXPECTED_ERROR };
    }
}

export interface UpdateTarifaMultaActionParams {
    session?: Session | null;
    motivo: MotivoMulta | string;
    monto: number;
}

export async function updateTarifaMultaAction(
    params: UpdateTarifaMultaActionParams
): Promise<ActionState<{ tarifa: TarifaMulta }>> {
    try {
        const session = resolveSession(params.session);
        if (!session?.accessToken) {
            return { success: false, error: ErrorMessages.AUTH_UNAUTHORIZED };
        }

        const result = await updateTarifaMultaUseCase.execute({
            session,
            motivo: params.motivo,
            monto: params.monto
        });

        return {
            success: true,
            data: result,
            message: "Tarifa de multa actualizada."
        };
    } catch (error: any) {
        return { success: false, error: error?.message || ErrorMessages.UNEXPECTED_ERROR };
    }
}
