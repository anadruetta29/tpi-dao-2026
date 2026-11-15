import { type ActionState } from "@/core/types";
import { EstadoMulta, type Multa } from "@/domain/entities/multa";
import { EstadoPrestamo, type Prestamo } from "@/domain/entities/prestamo";
import { EstadoReserva, type Reserva } from "@/domain/entities/reserva";
import { type Socio } from "@/domain/entities/socio";
import { type Session } from "@/domain/entities/session";
import { getAllEjemplaresAction } from "@/ui/actions/ejemplar/ejemplar.actions";
import { getAllMultasAction } from "@/ui/actions/multa/multa.actions";
import { getAllPrestamosAction, getPrestamoByIdAction } from "@/ui/actions/prestamo/prestamo.actions";
import { getAllReservasAction } from "@/ui/actions/reserva/reserva.actions";
import { getAllSociosAction } from "@/ui/actions/socio/socio.actions";

export type CriterioMostrador = "auto" | "dni" | "codigo" | "prestamo";

export interface MostradorResultado {
    prestamos: Prestamo[];
    socio?: Socio;
    multasPendientes: Multa[];
    reservasListas: Reserva[];
    ejemplarIdBuscado?: string;
}

const noEncontrado: ActionState<Prestamo[]> = { success: true, data: [] };

function enMostrador(prestamo: Prestamo, sedeId: string): boolean {
    return prestamo.estado !== EstadoPrestamo.DEVUELTO && (!sedeId || prestamo.sedeId === sedeId);
}

export function detectarCriterioMostrador(valor: string): "dni" | "codigo" | "prestamo" {
    const texto = valor.trim();
    if (texto.startsWith("#") || /^[1-9]\d{0,5}$/.test(texto)) return "prestamo";
    if (/^\d{7,8}$/.test(texto)) return "dni";
    return "codigo";
}

export async function buscarPrestamosMostradorAction(
    session: Session,
    sedeId: string,
    criterio: CriterioMostrador,
    valor: string
): Promise<ActionState<Prestamo[]>> {
    const resultado = await buscarMostradorCompletoAction(session, sedeId, criterio, valor, false);
    if (!resultado.success || !resultado.data) {
        return { success: false, error: resultado.error };
    }
    return { success: true, data: resultado.data.prestamos };
}

export async function buscarMostradorCompletoAction(
    session: Session,
    sedeId: string,
    criterio: CriterioMostrador,
    valor: string,
    incluirDetalleSocio: boolean = true
): Promise<ActionState<MostradorResultado>> {
    const texto = valor.trim();
    if (!texto) {
        return { success: true, data: { prestamos: noEncontrado.data ?? [], multasPendientes: [], reservasListas: [] } };
    }

    const criterioReal = criterio === "auto" ? detectarCriterioMostrador(texto) : criterio;

    if (criterioReal === "prestamo") {
        const id = texto.replace(/^#/, "");
        if (!/^[1-9]\d*$/.test(id)) {
            return { success: false, error: "Ingresá un número de préstamo válido." };
        }
        const resultado = await getPrestamoByIdAction(id, session);
        if (!resultado.success || !resultado.data) return { success: false, error: resultado.error };
        const { prestamo } = resultado.data;
        return {
            success: true,
            data: {
                prestamos: enMostrador(prestamo, sedeId) ? [prestamo] : [],
                multasPendientes: [],
                reservasListas: []
            }
        };
    }

    if (criterioReal === "dni") {
        if (!/^\d{7,8}$/.test(texto) || Number(texto) === 0) {
            return { success: false, error: "Ingresá un DNI de 7 u 8 dígitos." };
        }
        const resultado = await getAllSociosAction({ session, documento: texto });
        if (!resultado.success) return { success: false, error: resultado.error };
        const socio = resultado.data?.find(({ documento }) => documento === texto);
        if (!socio) {
            return { success: true, data: { prestamos: [], multasPendientes: [], reservasListas: [] } };
        }
        const [prestamos, multas, reservas] = await Promise.all([
            getAllPrestamosAction({ session, sede_id: sedeId, socio_id: socio.id }),
            incluirDetalleSocio ? getAllMultasAction({ session, socio_id: socio.id, estado: EstadoMulta.PENDIENTE }) : Promise.resolve(null),
            incluirDetalleSocio ? getAllReservasAction({ session, socioId: socio.id, sedeId, estado: EstadoReserva.LISTA_PARA_RETIRO }) : Promise.resolve(null)
        ]);
        if (!prestamos.success || !prestamos.data) return { success: false, error: prestamos.error };
        return {
            success: true,
            data: {
                prestamos: prestamos.data.prestamos.filter((prestamo) => enMostrador(prestamo, sedeId)),
                socio: incluirDetalleSocio ? socio : undefined,
                multasPendientes: multas && multas.success && multas.data ? multas.data.multas : [],
                reservasListas: reservas && reservas.success && reservas.data ? reservas.data : []
            }
        };
    }

    const ejemplares = await getAllEjemplaresAction({ session, sede_id: sedeId });
    if (!ejemplares.success || !ejemplares.data) return { success: false, error: ejemplares.error };
    const codigo = texto.toLowerCase();
    const coincidentes = ejemplares.data.ejemplares.filter((ejemplar) => ejemplar.codigo.toLowerCase() === codigo);
    const ejemplarIds = new Set(coincidentes.map(({ id }) => id));
    if (!ejemplarIds.size) {
        return { success: true, data: { prestamos: [], multasPendientes: [], reservasListas: [] } };
    }
    const prestamos = await getAllPrestamosAction({ session, sede_id: sedeId });
    if (!prestamos.success || !prestamos.data) return { success: false, error: prestamos.error };
    return {
        success: true,
        data: {
            prestamos: prestamos.data.prestamos.filter((prestamo) => {
                if (!enMostrador(prestamo, sedeId)) return false;
                const ids = "ejemplaresIds" in prestamo && Array.isArray(prestamo.ejemplaresIds)
                    ? prestamo.ejemplaresIds : [prestamo.ejemplarId];
                const devueltos = "ejemplaresDevueltosIds" in prestamo && Array.isArray(prestamo.ejemplaresDevueltosIds)
                    ? prestamo.ejemplaresDevueltosIds : [];
                return ids.some((id) => ejemplarIds.has(id) && !devueltos.includes(id));
            }),
            multasPendientes: [],
            reservasListas: [],
            ejemplarIdBuscado: coincidentes.length === 1 ? coincidentes[0].id : undefined
        }
    };
}
